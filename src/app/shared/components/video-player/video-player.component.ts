import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, viewChild, effect, signal, computed, input, output, untracked } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Platform } from '@angular/cdk/platform';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { patchState } from '@ngrx/signals';
import { DeepSignal } from '@ngrx/signals/src/deep-signal';
import { type TextTrackInit, type MediaPlayEvent, type AudioTrack, type MediaLoadedMetadataEvent, type PlayerSrc } from 'vidstack';
import { debounceTime, filter, first, forkJoin, fromEvent, Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { supportsMediaSource } from 'dashjs';
import { isEqual } from 'lodash-es';

import type { MediaDetails, MediaStream, UserSettings } from '../../../core/models';
import type { UpdateUserSettingsDto } from '../../../core/dto/users';
import type { KPSubtitleTrack, PlayerSettings, PlayerStore, PlayerSupports, ThumbnailStore } from './interfaces';
import { AuthService, DestroyService, UsersService } from '../../../core/services';
import { VideoPlayerService } from './video-player.service';
import { VideoPlayerStore } from './video-player.store';
import { AudioCodec, MediaStorageType, MediaType } from '../../../core/enums';
import { getFontFamily, getTextEdgeStyle, prepareColor, scaleFontWeight, track_Id } from '../../../core/utils';
import { BaseVideoPlayerComponent } from './base-video-player/base-video-player.component';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    VideoPlayerService,
    VideoPlayerStore,
    DestroyService,
    UsersService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: ['languages', 'media', 'player']
    }
  ],
  host: {
    class: 'tw-block'
  }
})
export class VideoPlayerComponent implements OnInit {
  track_Id = track_Id;
  AudioCodec = AudioCodec;

  media = input<MediaDetails>();
  canFitWindow = input<boolean>(false);
  canReqNext = input<boolean>(false);
  canReqPrev = input<boolean>(false);
  stream = input<MediaStream>();
  initPlaytime = input<number>();

  onEnded = output<void>();
  requestFitWindow = output<boolean>();
  requestNext = output<void>();
  requestPrev = output<void>();

  playerSrc = signal<PlayerSrc>('');
  userSettings = signal<UserSettings | null>(null);
  thumbnailPlaceholderSize = signal<{ width: string, height: string }>({ width: '0', height: '0' });

  player = computed(() => this.baseVideoPlayer()?.player() || null);
  sliderThumbnailEl = computed(() => this.baseVideoPlayer()?.sliderThumbnailEl() || null);
  pendingUpdateSettings = computed<UpdateUserSettingsDto>(() => ({
    player: {
      muted: this.playerSettings.isMuted(),
      volume: Math.round(this.playerSettings.activeVolume() * 100),
      subtitle: this.playerSettings.showSubtitle(),
      subtitleLang: this.playerSettings.activeTrackValue(),
      speed: this.playerSettings.activeSpeedValue() * 100,
      audioTrack: this.playerSettings.activeAudioCodec(),
      audioSurround: this.playerSettings.isSurroundAudio(),
      quality: this.playerSettings.activeQualityValue(),
      autoNext: this.playerSettings.autoNext()
    }
  }));

  baseVideoPlayer = viewChild<BaseVideoPlayerComponent>('basePlayerComponent');

  playerSettings: DeepSignal<PlayerSettings>;
  playerSupports: DeepSignal<PlayerSupports>;
  playerStore: DeepSignal<PlayerStore>;
  thumbnailStore: DeepSignal<ThumbnailStore>;

  streamData?: MediaStream;
  userSettingsLoaded: boolean = false;

  private platform = inject(Platform);
  private videoPlayerStore = inject(VideoPlayerStore);

  constructor(private ref: ChangeDetectorRef, private translocoService: TranslocoService,
    private authService: AuthService, private usersService: UsersService, private videoPlayerService: VideoPlayerService,
    private destroyService: DestroyService) {
    this.playerSettings = this.videoPlayerStore.settingsState;
    this.playerSupports = this.videoPlayerStore.supportsState;
    this.playerStore = this.videoPlayerStore.storeState;
    this.thumbnailStore = this.videoPlayerStore.thumbnailStoreState;
    // Run on player attach
    effect(() => {
      const player = this.player();
      if (!player) return;
      this.onPlayerAttach();
    });
    // Apply player settings
    effect(() => {
      const player = this.player();
      const playerSrc = this.playerSrc();
      if (player && playerSrc) {
        // Apply settings to the player when playing
        this.applySourceSettingsOnLoaded();
      }
    });
    // On source change
    effect(() => {
      if (!this.player())
        return;
      const stream = this.stream();
      if (!stream) {
        this.baseVideoPlayer()?.unsetPlayerSource();
        return;
      }
      if (this.streamData === stream) return;
      this.streamData = stream;
      this.setPlayerData(stream);
    }, { allowSignalWrites: true });
    // Set init play time
    effect(() => {
      const initPlaytime = this.initPlaytime();
      if (!initPlaytime) return;
      patchState(this.videoPlayerStore.settingsState, { initPlaytime });
    }, { allowSignalWrites: true });
    // On user settings change
    toObservable(this.pendingUpdateSettings).pipe(
      filter(() => this.userSettingsLoaded),
      debounceTime(3000),
      filter(updateUserSettingsDto => !isEqual(updateUserSettingsDto.player, this.userSettings()?.player)),
      switchMap(updateUserSettingsDto => this.updateUserSettings(updateUserSettingsDto)),
      takeUntil(this.destroyService)
    ).subscribe();
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      if (!user) return;
      this.userSettings.set(user.settings || null);
      this.applyUserSettings();
      this.updateSubtitleStyles();
      this.userSettingsLoaded = true;
    });
  }

  onPlayerAttach() {
    // Set init audio track when track list is available
    fromEvent<MediaLoadedMetadataEvent>(this.player()!, 'loaded-metadata').pipe(first()).subscribe(() => {
      this.setInitAudioTrack(this.playerSettings.initAudioValue(), this.playerSettings.initAudioSurround());
    });
  }

  //** Run when stream input changed */
  setPlayerData(data: MediaStream): void {
    const tracks: KPSubtitleTrack[] = [];
    if (data.subtitles?.length) {
      this.translocoService.selectTranslation('languages').pipe(first()).subscribe(t => {
        data.subtitles.sort().forEach(subtitle => {
          const srcSplit = subtitle.src.split('.');
          const subtitleEncoding = this.videoPlayerService.isGzipSubtitle(subtitle.mimeType) ? 'gzip' :
            this.videoPlayerService.isBrotliSubtitle(subtitle.mimeType) ? 'br' : null;
          const trackType = <'vtt' | 'srt' | 'ass' | 'ssa'>(subtitleEncoding !== null ?
            srcSplit[srcSplit.length - 2] :
            srcSplit[srcSplit.length - 1]);
          const subtitleSrc = new URL(subtitle.src);
          if (subtitleEncoding !== null) {
            subtitleSrc.searchParams.set('set-content-encoding', subtitleEncoding);
            subtitleSrc.searchParams.set('set-content-type', 'text/plain');
          }
          tracks.push({
            _id: subtitle._id,
            label: t[subtitle.lang],
            lang: subtitle.lang,
            src: subtitleSrc.href,
            mimeType: subtitle.mimeType,
            type: trackType
          });
        });
        patchState(this.videoPlayerStore.settingsState, { subtitleTracks: tracks });
        this.setPlayerTrackList();
      });
    }
    patchState(this.videoPlayerStore.settingsState, {
      sourceBaseUrl: data.baseUrl,
      previewThumbnail: data.baseUrl.replace(':path', data.previewThumbnail)
    });
    this.setPlayerSource();
    this.setPlayerPreviewThumbnail();
  }

  applyUserSettings(): void {
    const userSettings = this.userSettings();
    if (!userSettings) return;
    if (userSettings.player.speed != undefined && userSettings.player.speed >= 0)
      patchState(this.videoPlayerStore.settingsState, { activeSpeedValue: userSettings.player.speed / 100 });
    if (userSettings.player.muted)
      patchState(this.videoPlayerStore.settingsState, { isMuted: userSettings.player.muted });
    if (userSettings.player.audioTrack != undefined)
      patchState(this.videoPlayerStore.settingsState, { initAudioValue: userSettings.player.audioTrack });
    if (userSettings.player.audioSurround != undefined)
      patchState(this.videoPlayerStore.settingsState, { initAudioSurround: userSettings.player.audioSurround });
    if (userSettings.player.quality != undefined)
      patchState(this.videoPlayerStore.settingsState, { activeQualityValue: userSettings.player.quality });
    if (userSettings.player.subtitle != undefined)
      patchState(this.videoPlayerStore.settingsState, { showSubtitle: userSettings.player.subtitle });
    if (userSettings.player.volume != undefined)
      patchState(this.videoPlayerStore.settingsState, { activeVolume: userSettings.player.volume / 100 });
    if (userSettings.player.autoNext != undefined)
      patchState(this.videoPlayerStore.settingsState, { autoNext: userSettings.player.autoNext });
  }

  setPlayerTrackList(): void {
    const player = this.player()!;
    if (!player) return;
    const defaultLanguage = this.playerSettings.activeTrackValue() ||
      this.userSettings()?.player.subtitleLang ||
      this.translocoService.getActiveLang();
    // Get the previously selected subtitle language
    //const lastSubtitleLanguage = this.player.textTracks.selected?.language;
    // Remove all existing subtitles
    const oldSubtitles = player.textTracks.getByKind('subtitles');
    oldSubtitles.forEach(s => {
      player.textTracks.remove(s);
    });
    const subtitleTracks = this.playerSettings.subtitleTracks();
    for (let i = 0; i < subtitleTracks.length; i++) {
      const track = subtitleTracks[i];
      const textTrack: TextTrackInit = {
        id: track._id,
        label: track.label,
        language: track.lang,
        src: track.src,
        kind: 'subtitles',
        type: track.type,
        mimeType: track.mimeType,
      };
      // if (this.videoPlayerService.isGzipSubtitle(track.mimeType)) {
      //   textTrack.subtitleLoader = (loadTrack) => firstValueFrom(this.videoPlayerService.loadGzipSubtitle(loadTrack.src!));
      // }
      if (textTrack.language === defaultLanguage) {
        textTrack.default = true;
        patchState(this.videoPlayerStore.settingsState, { activeTrackValue: textTrack.language });
      }
      //   if (lastSubtitleLanguage && track.lang === lastSubtitleLanguage) {
      //     // Select subtitle based on the previously selected language
      //     textTrack.default = true;
      //     this.playerSettings.activeTrackValue = textTrack.language!;
      //     this.playerSettings.showSubtitle = true;
      //   } else if (this.userSettings_()?.player.subtitle && track.lang === defaultLanguage) {
      //     // Select subtitle based on user settings
      //     textTrack.default = true;
      //     this.playerSettings.activeTrackValue = textTrack.language!;
      //     this.playerSettings.showSubtitle = true;
      //   }
      player.textTracks.add(textTrack);
    };
  }

  setPlayerSource(): void {
    if (!this.streamData?.streams) return;
    const playlist = this.streamData.streams.find(s => s.type === MediaStorageType.MANIFEST);
    if (!playlist) return;
    const playlistSrc = this.playerSettings.sourceBaseUrl().replace(':path', `${playlist._id}/${playlist.name}`);
    if (supportsMediaSource()) {
      // Use dash.js when supported
      this.videoPlayerService.generateParsedDash(playlistSrc, this.playerSettings.sourceBaseUrl(), { opus: this.playerSupports.hlsOpus() })
        .subscribe(manifest => {
          // Set source url
          this.playerSrc.set({ src: manifest, type: 'video/dash' });
        });
    } else {
      // Fallback to native HLS
      this.videoPlayerService.generateM3U8(playlistSrc, this.playerSettings.sourceBaseUrl(), { opus: false })
        .subscribe(manifestSrc => {
          this.playerSrc.set({ src: manifestSrc, type: 'application/x-mpegurl' });
        });
    }
  }

  setPlayerPreviewThumbnail(): void {
    const sliderThumbnailEl = this.sliderThumbnailEl()!;
    if (!sliderThumbnailEl) return;
    const storeDisposeFn: any[] = [];
    storeDisposeFn.push(
      sliderThumbnailEl.subscribe(({ activeThumbnail }) => {
        patchState(this.videoPlayerStore.thumbnailStoreState, { activeThumbnail });
        this.onActiveThumbnailChange();
        this.ref.markForCheck();
      }),
      sliderThumbnailEl.subscribe(({ loading }) => {
        patchState(this.videoPlayerStore.thumbnailStoreState, { loading });
        this.ref.markForCheck();
      })
    );
    patchState(this.videoPlayerStore.settingsState, (state) => ({ storeDisposeFn: [...state.storeDisposeFn, ...storeDisposeFn] }));
    if (!this.playerSettings.previewThumbnail()) {
      sliderThumbnailEl.src = '';
      return;
    }
    this.videoPlayerService.getPreviewThumbnails(this.videoPlayerStore.settingsState.previewThumbnail()!).subscribe(thumbnailFrames => {
      if (!thumbnailFrames) {
        sliderThumbnailEl!.src = '';
        return;
      }
      patchState(this.videoPlayerStore.settingsState, { thumbnailFrames });
      const generatedFrames = this.videoPlayerService.createThumbnailFrames(thumbnailFrames);
      sliderThumbnailEl!.src = {
        baseURL: this.playerSettings.previewThumbnail()!,
        thumbs: generatedFrames
      };
    });
  }

  onActiveThumbnailChange() {
    patchState(this.videoPlayerStore.settingsState, { activeThumbPlaceholder: null });
    if (this.thumbnailStore.activeThumbnail() && this.playerSettings.thumbnailFrames().length) {
      const activeFrame = this.playerSettings.thumbnailFrames().find(f => f.startTime === this.thumbnailStore.activeThumbnail()!.startTime);
      patchState(this.videoPlayerStore.settingsState, { activeThumbPlaceholder: activeFrame ? activeFrame.placeholder : null });
      //this.setThumbnailPlaceholderSize();
    }
    this.ref.markForCheck();
  }

  // setThumbnailPlaceholderSize() {
  //   // Set thumbnail placeholder size
  //   const sliderThumbnailEl = this.sliderThumbnailEl();
  //   if (sliderThumbnailEl) {
  //     const sliderThumbnailStyles = getComputedStyle(sliderThumbnailEl);
  //     const thumbnailWidth = sliderThumbnailStyles.getPropertyValue('--thumbnail-width');
  //     const thumbnailHeight = sliderThumbnailStyles.getPropertyValue('--thumbnail-height');
  //     if (thumbnailWidth && thumbnailHeight) {
  //       this.thumbnailPlaceholderSize.set({
  //         width: thumbnailWidth,
  //         height: thumbnailHeight
  //       });
  //     }
  //   }
  // }

  applySourceSettingsOnLoaded() {
    const player = this.player()!;
    fromEvent<MediaLoadedMetadataEvent>(player, 'loaded-data').pipe(first()).subscribe(() => {
      player.muted = this.playerSettings.isMuted();
      player.volume = this.playerSettings.activeVolume();
      // Set audio track when the source is changed
      if (this.playerSettings.activeAudioLang()) {
        this.setAudioTrackByLang(this.playerSettings.activeAudioLang()!, this.playerSettings.initAudioValue());
      }
      // Set video quality when the source is changed
      if (this.playerSettings.activeQualityValue() > 0) {
        this.baseVideoPlayer()?.changeVideoQuality(this.playerSettings.activeQualityValue());
      }
      // Set subtitle when the source is changed
      if (this.playerSettings.activeTrackValue() !== null) {
        this.baseVideoPlayer()?.setPlayerTrack(this.playerSettings.activeTrackValue());
      }
    });
    // Move set time to play event because of some issues with autoplay
    fromEvent<MediaPlayEvent>(player, 'play').pipe(first()).subscribe(() => {
      player.currentTime = this.playerSettings.initPlaytime();
      player.playbackRate = this.playerSettings.activeSpeedValue();
    });
  }

  setInitAudioTrack(codec: number | null, surroundAudio: boolean | null) {
    const player = this.player()!;
    if (!player || player.audioTracks.readonly) return;
    const audioTracks = player.audioTracks.toArray();
    let audioTrack: AudioTrack | undefined;
    // Select exact audio by codec
    if (codec !== null) {
      audioTrack = audioTracks.find(a => Number(a.label.split(' - ')[2]) === codec);
    }
    // Fallback option to select any stereo or surround track
    if (!audioTrack && surroundAudio !== null) {
      audioTrack = audioTracks.find(a => {
        const aCodec = Number(a.label.split(' - ')[2]);
        if (surroundAudio)
          return [AudioCodec.AAC_SURROUND, AudioCodec.OPUS_SURROUND].includes(aCodec);
        return [AudioCodec.AAC, AudioCodec.OPUS].includes(aCodec);
      });
    }
    if (!audioTrack)
      audioTrack = audioTracks[0];
    audioTrack.selected = true;
    patchState(this.videoPlayerStore.settingsState, { activeAudioLang: audioTrack.language });
  }

  setAudioTrackByLang(lang: string, codec?: number | null): void {
    const player = this.player()!;
    if (!player || player.audioTracks.readonly) return;
    const audioTracks = player.audioTracks.toArray();
    // Get all audio track with selected languages
    const filteredAudioTracks = audioTracks.filter(a => a.language === lang);
    if (!filteredAudioTracks.length) return;
    let audioTrack: AudioTrack | undefined;
    // Select exact audio by codec
    if (codec != null)
      audioTrack = filteredAudioTracks.find(a => Number(a.label.split(' - ')[2]) === codec);
    if (!audioTrack)
      audioTrack = filteredAudioTracks[0];
    audioTrack.selected = true;
  }

  toggleNext(): void {
    this.requestNext.emit();
  }

  togglePrev(): void {
    this.requestPrev.emit();
  }

  toggleFullwindow(): void {
    this.requestFitWindow.emit(this.playerSettings.fullWindow());
  }

  handleMediaEnded(): void {
    this.onEnded.emit();
  }

  updateUserSettings(updateUserSettingsDto: UpdateUserSettingsDto): Observable<UserSettings | null> {
    if (!this.authService.currentUser) return of(null);
    return this.usersService.updateSettings(this.authService.currentUser!._id, updateUserSettingsDto).pipe(tap(settings => {
      this.authService.currentUser = {
        ...this.authService.currentUser!,
        settings: { ...settings }
      };
      this.ref.markForCheck();
    }));
  }

  updateSubtitleStyles(): void {
    if (!this.userSettings()) return;
    const settings = this.userSettings()!.subtitle;
    const textColor = settings.textColor != undefined ? ('#' + settings.textColor.toString(16)) : null;
    const backgroundColor = settings.bgColor != undefined ? ('#' + settings.bgColor.toString(16)) : null;
    const windowColor = settings.winColor != undefined ? ('#' + settings.winColor.toString(16)) : null;
    const textAlpha = settings.textAlpha != undefined ? settings.textAlpha : 100;
    const backgroundAlpha = settings.bgAlpha != undefined ? settings.bgAlpha : 100;
    const windowAlpha = settings.winAlpha != undefined ? settings.winAlpha : 100;
    patchState(this.videoPlayerStore.settingsState, {
      subtitleStyles: {
        'font-family': getFontFamily(settings.fontFamily),
        '--cue-font-size-scale': (settings.fontSize || 100) / 100,
        '--cue-color': prepareColor(textColor, textAlpha),
        '--cue-font-weight': scaleFontWeight(settings.fontWeight),
        '--cue-text-shadow': getTextEdgeStyle(settings.textEdge),
        '--cue-bg-color': prepareColor(backgroundColor, backgroundAlpha, 'transparent'),
        '--cue-window-color': prepareColor(windowColor, windowAlpha, 'transparent')
      }
    });
  }

  registerMediaSession(): void {
    const media = this.media();
    // Check browser support and media data
    if (!('mediaSession' in navigator) || this.platform.FIREFOX || !media) return;
    // Set metadata
    const artwork: MediaImage[] = [];
    media.smallPosterUrl && artwork.push({ src: media.smallPosterUrl, sizes: '167x250' });
    media.thumbnailPosterUrl && artwork.push({ src: media.thumbnailPosterUrl, sizes: '300x450' });
    media.posterUrl && artwork.push({ src: media.posterUrl, sizes: '500x750' });
    const typeKey = media.type === MediaType.MOVIE ? 'mediaTypes.movie' : 'mediaTypes.tvShow';
    forkJoin([
      this.translocoService.selectTranslate(typeKey, {}, 'media').pipe(first()),
      this.translocoService.selectTranslate('episode.episodePrefix', {}, 'media').pipe(first())
    ]).pipe(first()).subscribe(([mediaType, episodePrefix]) => {
      let artistValue = mediaType;
      if (media!.type === MediaType.TV && this.streamData?.episode)
        artistValue += ' - ' + episodePrefix + ' ' + this.streamData.episode.epNumber;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: media!.title,
        artist: artistValue,
        artwork: artwork
      });
    });
    // Set action handlers
    const nextTrackFn = this.canReqNext() ? () => { this.requestNext.emit() } : null;
    const prevTrackFn = this.canReqPrev() ? () => { this.requestPrev.emit() } : null;
    try {
      navigator.mediaSession.setActionHandler('nexttrack', nextTrackFn);
      navigator.mediaSession.setActionHandler('previoustrack', prevTrackFn);
    } catch { }
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        details.seekTime && (this.player()!.currentTime = details.seekTime);
      });
    } catch { }
  }

  // unregisterMediaSession(): void {
  //   navigator.mediaSession.metadata = null;
  //   navigator.mediaSession.setActionHandler('nexttrack', null);
  //   navigator.mediaSession.setActionHandler('previoustrack', null);
  //   navigator.mediaSession.setActionHandler('seekto', null);
  // };
}
