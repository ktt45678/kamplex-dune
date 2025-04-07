import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, viewChild, effect, signal, computed, input, output } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Platform } from '@angular/cdk/platform';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { patchState } from '@ngrx/signals';
import { DeepSignal } from '@ngrx/signals/src/deep-signal';
import { type TextTrackInit, type MediaPlayEvent, type AudioTrack, type MediaLoadedMetadataEvent, type PlayerSrc, type TextTrack, MediaLoadedDataEvent, MediaCanPlayThroughEvent } from 'vidstack';
import { debounceTime, filter, first, forkJoin, fromEvent, Observable, of, switchMap, takeUntil, takeWhile, tap } from 'rxjs';
import { supportsMediaSource } from 'dashjs';
import { isEqual } from 'lodash-es';

import type { MediaDetails, MediaStream, UserSettings } from '../../../core/models';
import type { UpdateUserSettingsDto } from '../../../core/dto/users';
import type { KPSubtitleTrack, PlayerSettings, PlayerStore, PlayerSupports, ThumbnailStore } from './interfaces';
import type { LocalPlayerSettings } from '../../../core/interfaces/video-player';
import { AuthService, DestroyService, UsersService } from '../../../core/services';
import { VideoPlayerService } from './video-player.service';
import { VideoPlayerStore } from './video-player.store';
import { AudioCodec, MediaStorageType, MediaType, VideoCodec } from '../../../core/enums';
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
  localSettings = signal<LocalPlayerSettings | null>(null);
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
  pendingLocalSettings = computed<LocalPlayerSettings>(() => {
    const subtitleSettings = this.localSettings()?.subtitle || {};
    return {
      player: {
        muted: this.playerSettings.isMuted(),
        volume: Math.round(this.playerSettings.activeVolume() * 100),
        audioGain: this.playerSettings.audioGain(),
        subtitle: this.playerSettings.showSubtitle(),
        subtitleLang: this.playerSettings.activeTrackValue(),
        speed: this.playerSettings.activeSpeedValue() * 100,
        audioTrack: this.playerSettings.activeAudioCodec(),
        audioSurround: this.playerSettings.isSurroundAudio(),
        quality: this.playerSettings.activeQualityValue(),
        autoNext: this.playerSettings.autoNext()
      },
      subtitle: { ...subtitleSettings }
    }
  });

  baseVideoPlayer = viewChild<BaseVideoPlayerComponent>('basePlayerComponent');

  playerSettings: DeepSignal<PlayerSettings>;
  playerSupports: DeepSignal<PlayerSupports>;
  playerStore: DeepSignal<PlayerStore>;
  thumbnailStore: DeepSignal<ThumbnailStore>;

  streamData?: MediaStream;
  userSettingsLoaded: boolean = false;
  localSettingsLoaded: boolean = false;

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
      if (initPlaytime == null) return;
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
    // On local settings change
    toObservable(this.pendingLocalSettings).pipe(
      filter(() => this.localSettingsLoaded),
      debounceTime(2000),
      filter(updateLocalSettings => !isEqual(updateLocalSettings.player, this.localSettings()?.player)),
      tap(updateLocalSettings => this.videoPlayerService.updateLocalSettings(updateLocalSettings)),
      takeUntil(this.destroyService)
    ).subscribe();
  }

  ngOnInit(): void {
    const localSettings = this.videoPlayerService.getLocalSettings();
    if (localSettings) {
      this.localSettings.set(localSettings);
      this.applyLocalSettings();
    }
    this.localSettingsLoaded = true;
    this.authService.currentUser$.pipe(takeWhile(() => !this.userSettingsLoaded)).subscribe(user => {
      if (!user) return;
      this.userSettings.set(user.settings || null);
      this.applyUserSettings();
      this.userSettingsLoaded = true;
    });
  }

  onPlayerAttach() {
    // Set init audio track when track list is available
    fromEvent<MediaLoadedMetadataEvent>(this.player()!, 'loaded-metadata').pipe(first()).subscribe(() => {
      this.setInitAudioTrack();
    });
  }

  //** Run when stream input changed */
  setPlayerData(data: MediaStream): void {
    const tracks: KPSubtitleTrack[] = [];
    this.translocoService.selectTranslation('languages').pipe(first()).subscribe(t => {
      if (data.subtitles?.length) {
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
      }
      patchState(this.videoPlayerStore.settingsState, { subtitleTracks: tracks });
      this.setPlayerTrackList();
    });
    patchState(this.videoPlayerStore.settingsState, {
      sourceBaseUrl: data.baseUrl,
      previewThumbnail: data.baseUrl.replace(':path', data.previewThumbnail)
    });
    this.setPlayerSource();
    this.setPlayerPreviewThumbnail();
  }

  applyUserSettings(): void {
    const userSettings = this.userSettings();
    const localSettings = this.localSettings();
    if (!userSettings) return;
    const overrideLocalSettings: LocalPlayerSettings = {
      player: {
        audioGain: localSettings?.player?.audioGain,
        speed: userSettings.player.speed,
        muted: userSettings.player.muted,
        audioTrack: userSettings.player.audioTrack,
        audioSurround: userSettings.player.audioSurround,
        quality: userSettings.player.quality,
        subtitle: userSettings.player.subtitle,
        volume: userSettings.player.volume,
        autoNext: userSettings.player.autoNext,
        prefAudioLang: userSettings.player.prefAudioLang,
        prefAudioLangList: userSettings.player.prefAudioLangList,
        prefSubtitleLang: userSettings.player.prefSubtitleLang,
        prefSubtitleLangList: userSettings.player.prefSubtitleLangList
      },
      subtitle: {
        fontSize: userSettings.subtitle.fontSize,
        fontFamily: userSettings.subtitle.fontFamily,
        fontWeight: userSettings.subtitle.fontWeight,
        textColor: userSettings.subtitle.textColor,
        textAlpha: userSettings.subtitle.textAlpha,
        textEdge: userSettings.subtitle.textEdge,
        bgColor: userSettings.subtitle.bgColor,
        bgAlpha: userSettings.subtitle.bgAlpha,
        winColor: userSettings.subtitle.winColor,
        winAlpha: userSettings.subtitle.winAlpha
      }
    };
    this.videoPlayerService.updateLocalSettings(overrideLocalSettings);
    this.localSettings.set(overrideLocalSettings);
    this.applyLocalSettings();
  }

  applyLocalSettings(): void {
    const localSettings = this.localSettings();
    if (!localSettings) return;
    if (localSettings.player) {
      if (localSettings.player.speed != undefined && localSettings.player.speed >= 0)
        patchState(this.videoPlayerStore.settingsState, { activeSpeedValue: localSettings.player.speed / 100 });
      if (localSettings.player.muted)
        patchState(this.videoPlayerStore.settingsState, { isMuted: localSettings.player.muted });
      if (localSettings.player.audioGain != undefined)
        patchState(this.videoPlayerStore.settingsState, { audioGain: localSettings.player.audioGain });
      if (localSettings.player.audioTrack != undefined)
        patchState(this.videoPlayerStore.settingsState, { initAudioValue: localSettings.player.audioTrack });
      if (localSettings.player.audioSurround != undefined)
        patchState(this.videoPlayerStore.settingsState, { initAudioSurround: localSettings.player.audioSurround });
      if (localSettings.player.quality != undefined)
        patchState(this.videoPlayerStore.settingsState, { activeQualityValue: localSettings.player.quality });
      if (localSettings.player.subtitle != undefined)
        patchState(this.videoPlayerStore.settingsState, { showSubtitle: localSettings.player.subtitle });
      if (localSettings.player.volume != undefined)
        patchState(this.videoPlayerStore.settingsState, { activeVolume: localSettings.player.volume / 100 });
      if (localSettings.player.autoNext != undefined)
        patchState(this.videoPlayerStore.settingsState, { autoNext: localSettings.player.autoNext });
      if (localSettings.player.prefAudioLang != undefined)
        patchState(this.videoPlayerStore.settingsState, { prefAudioLang: localSettings.player.prefAudioLang });
      if (localSettings.player.prefAudioLangList != undefined)
        patchState(this.videoPlayerStore.settingsState, { prefAudioLangList: localSettings.player.prefAudioLangList });
      if (localSettings.player.prefSubtitleLang != undefined)
        patchState(this.videoPlayerStore.settingsState, { prefSubtitleLang: localSettings.player.prefSubtitleLang });
      if (localSettings.player.prefSubtitleLangList != undefined)
        patchState(this.videoPlayerStore.settingsState, { prefSubtitleLangList: localSettings.player.prefSubtitleLangList });
    }
    if (localSettings.subtitle) {
      this.updateSubtitleStyles();
    }
  }

  setPlayerTrackList(): void {
    const player = this.player()!;
    if (!player) return;
    // Get the previously selected subtitle language
    //const lastSubtitleLanguage = this.player.textTracks.selected?.language;
    // Remove all existing subtitles
    const oldSubtitles = player.textTracks.getByKind('subtitles');
    oldSubtitles.forEach(s => {
      player.textTracks.remove(s);
    });
    const subtitleTracks = this.playerSettings.subtitleTracks();
    if (!subtitleTracks.length) return;
    const defaultLanguage = this.playerSettings.activeTrackValue() ||
      this.userSettings()?.player.subtitleLang ||
      this.translocoService.getActiveLang();
    const prefSubtitleLang = this.playerSettings.prefSubtitleLang();
    const prefSubtitleTrack = prefSubtitleLang ? this.selectPreferredKPSubtitle(this.playerSettings.prefSubtitleLangList(), subtitleTracks) : null;
    let defaultTrackSelected = false;
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
      if (this.playerSettings.showSubtitle() && !defaultTrackSelected) {
        // Select by preferred setting
        if (prefSubtitleLang && prefSubtitleTrack) {
          if (track.lang === prefSubtitleTrack.lang) {
            textTrack.default = true;
            patchState(this.videoPlayerStore.settingsState, { activeTrackValue: textTrack.language });
          }
        } else if (textTrack.language === defaultLanguage) {
          // Select by default language
          textTrack.default = true;
          patchState(this.videoPlayerStore.settingsState, { activeTrackValue: textTrack.language });
        }
        defaultTrackSelected = !!textTrack.default;
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
    if (supportsMediaSource()) {
      // Use dash.js when supported
      if (!this.streamData.streams.length) return;
      let playlists = this.streamData.streams.filter(s => s.type === MediaStorageType.MANIFEST);
      // Remove AV1 codec if not supported
      if (!this.playerSupports.av1())
        playlists = this.streamData.streams.filter(s => s.codec !== VideoCodec.AV1);
      // Sort by codec id
      playlists = playlists.sort((a, b) => a.codec - b.codec);
      const playlistSrcs = playlists.map(playlist =>
        this.playerSettings.sourceBaseUrl().replace(':path', `${playlist._id}/${playlist.name}`));
      this.videoPlayerService.generateParsedDashFromUrls(playlistSrcs, this.playerSettings.sourceBaseUrl(),
        { opus: this.playerSupports.hlsOpus(), av1: this.playerSupports.av1() }
      ).subscribe(manifest => {
        // Set source url
        this.playerSrc.set({ src: manifest, type: 'video/dash' });
      });
    } else {
      // Fallback to native HLS
      const playlist = this.streamData.streams.sort((a, b) => a.codec - b.codec).find(s => s.type === MediaStorageType.MANIFEST);
      if (!playlist) return;
      const playlistSrc = this.playerSettings.sourceBaseUrl().replace(':path', `${playlist._id}/${playlist.name}`);
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
    fromEvent<MediaCanPlayThroughEvent>(player, 'can-play-through').pipe(first()).subscribe(() => {
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
      if (this.playerSettings.showSubtitle() && this.playerSettings.activeTrackValue() !== null) {
        this.baseVideoPlayer()?.setPlayerTrack(this.playerSettings.activeTrackValue());
      }
      player.playbackRate = this.playerSettings.activeSpeedValue();
    });
    // Move set time to play event because of some issues with autoplay
    fromEvent<MediaPlayEvent>(player, 'play').pipe(first()).subscribe(() => {
      player.currentTime = this.playerSettings.initPlaytime();
      player.setAudioGain(this.playerSettings.audioGain());
    });
  }

  setInitAudioTrack() {
    const codec = this.playerSettings.initAudioValue();
    const surroundAudio = this.playerSettings.initAudioSurround();
    const prefAudioLang = this.playerSettings.prefAudioLang();
    const prefAudioLangList = this.playerSettings.prefAudioLangList();
    const player = this.player()!;
    if (!player || player.audioTracks.readonly) return;
    const audioTracks = player.audioTracks.toArray();
    let audioTrack: AudioTrack | undefined | null;
    // Select audio by preferred language
    if (prefAudioLang) {
      audioTrack = this.selectPreferredLanguage(prefAudioLangList, audioTracks);
    }
    // Select exact audio by codec
    if (!audioTrack && codec !== null) {
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

  selectPreferredLanguage(preferredLanguages: string[], trackList: TextTrack[]): TextTrack | null;
  selectPreferredLanguage(preferredLanguages: string[], trackList: AudioTrack[]): AudioTrack | null;
  selectPreferredLanguage(preferredLanguages: string[], trackList: AudioTrack[] | TextTrack[]): AudioTrack | TextTrack | null {
    for (let i = 0; i < preferredLanguages.length; i++) {
      const prefLanguage = preferredLanguages[i];
      if (prefLanguage === 'default')
        return null;
      const track = trackList.find(t => t.language === prefLanguage);
      if (track)
        return track;
    }
    return null;
  }

  selectPreferredKPSubtitle(preferredLanguages: string[], trackList: KPSubtitleTrack[]): KPSubtitleTrack | null {
    for (let i = 0; i < preferredLanguages.length; i++) {
      const prefLanguage = preferredLanguages[i];
      if (prefLanguage === 'default')
        return null;
      const track = trackList.find(t => t.lang === prefLanguage);
      if (track)
        return track;
    }
    return null;
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
    if (!this.localSettings()?.subtitle) return;
    const settings = this.localSettings()!.subtitle!;
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
