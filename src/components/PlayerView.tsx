import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Camera,
  Maximize2,
  Sliders,
  Grid,
  Volume2,
  VolumeX,
  Download,
} from 'lucide-react';
import { CanvasRenderer } from '../animation/canvasRenderer';
import { ExtendedPaperBallRenderer } from '../animation/extendedPaperBallRenderer';
import { HoopRenderer } from '../animation/hoopRenderer';
import { PaperBallRenderer } from '../animation/paperBallRenderer';
import { PopStageRenderer } from '../animation/popStageRenderer';
import { TrickShotRenderer } from '../animation/trickShotRenderer';
import { PingPongRenderer } from '../animation/pingPongRenderer';
import { DartShotRenderer } from '../animation/dartShotRenderer';
import { CoinFlipRenderer } from '../animation/coinFlipRenderer';
import { MachineRenderer } from '../animation/machineRenderer';
import { SequelPaperBallRenderer } from '../animation/sequelPaperBallRenderer';
import { MindTrapsRenderer } from '../animation/mindTrapsRenderer';
import { RunawayCakeRenderer } from '../animation/runawayCakeRenderer';
import { SelfBuildingRobotRenderer } from '../animation/selfBuildingRobotRenderer';
import { InfiniteGiftBoxRenderer } from '../animation/infiniteGiftBoxRenderer';
import { LivingTrafficLightRenderer } from '../animation/livingTrafficLightRenderer';
import { CloneButtonDisasterRenderer } from '../animation/cloneButtonDisasterRenderer';
import { RubberBandTrapRenderer } from '../animation/rubberBandTrapRenderer';
import { MysteryFloorHoleRenderer } from '../animation/mysteryFloorHoleRenderer';
import { SuperBouncyShoesRenderer } from '../animation/superBouncyShoesRenderer';
import { ShadowTrickshotRenderer } from '../animation/shadowTrickshotRenderer';
import { InvisibleWallRenderer } from '../animation/invisibleWallRenderer';
import { TenFanTrickshotRenderer } from '../animation/tenFanTrickshotRenderer';
import { HundredBallChainRenderer } from '../animation/hundredBallChainRenderer';
import { LongestRulerRenderer } from '../animation/longestRulerRenderer';
import { GiantSlinkyRenderer } from '../animation/giantSlinkyRenderer';
import { ImpossibleKeyholeRenderer } from '../animation/impossibleKeyholeRenderer';
import { ImpossibleLaserRenderer } from '../animation/impossibleLaserRenderer';
import { ImpossiblePinballRenderer } from '../animation/impossiblePinballRenderer';
import { ThousandDegreeHotShotRenderer } from '../animation/thousandDegreeHotShotRenderer';
import { MagneticMazeRenderer } from '../animation/magneticMazeRenderer';
import { SpiralStaircaseRenderer } from '../animation/spiralStaircaseRenderer';
import { GiantScissorRenderer } from '../animation/giantScissorRenderer';
import { TripleGravityRenderer } from '../animation/tripleGravityRenderer';
import { InvisibleTubeRenderer } from '../animation/invisibleTubeRenderer';
import { GiantGearRenderer } from '../animation/giantGearRenderer';
import { ReverseBowlingRenderer } from '../animation/reverseBowlingRenderer';
import { GiantYoyoRenderer } from '../animation/giantYoyoRenderer';
import {
  GIANT_YOYO_CUES,
  REVERSE_BOWLING_CUES,
  GIANT_GEAR_CUES,
  INVISIBLE_TUBE_CUES,
  TRIPLE_GRAVITY_CUES,
  GIANT_SCISSOR_CUES,
  SPIRAL_STAIRCASE_CUES,
  MAGNETIC_MAZE_CUES,
  HOT_SHOT_CUES,
  IMPOSSIBLE_PINBALL_CUES,
  IMPOSSIBLE_LASER_CUES,
  IMPOSSIBLE_KEYHOLE_CUES,
  GIANT_SLINKY_CUES,
  LONGEST_RULER_CUES,
  HUNDRED_BALL_CUES,
  TEN_FAN_CUES,
  INVISIBLE_WALL_CUES,
  SHADOW_TRICKSHOT_CUES,
  SUPER_BOUNCY_CUES,
  MYSTERY_HOLE_CUES,
  RUBBER_BAND_CUES,
  CLONE_DISASTER_CUES,
  LIVING_TRAFFIC_LIGHT_CUES,
  INFINITE_GIFT_BOX_CUES,
  SELF_BUILDING_ROBOT_CUES,
  RUNAWAY_CAKE_CUES,
  MIND_TRAPS_CUES,
  PAPER_BALL_30_CUES,
  POP_STAR_CUES,
  TRICK_SHOT_CUES,
  PING_PONG_CUES,
  DART_SHOT_CUES,
  COIN_FLIP_CUES,
  PAPER_BALL_PART3_CUES,
  PAPER_BALL_PART4_CUES,
  PAPER_BALL_SEQUEL_CUES,
} from '../audio/cueMaps';
import { soundEngine, speakVoiceOver, stopVoiceOver } from '../audio/soundEngine';
import { StudioConfig, PROJECTS, SceneDef, isPaperBallProject } from '../types';
import { YouTubeMetaCard } from './YouTubeMetaCard';

interface PlayerViewProps {
  config: StudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<StudioConfig>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenExport?: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  config,
  setConfig,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  onOpenExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shadowRendererRef = useRef<CanvasRenderer>(new CanvasRenderer());
  const paperBallRendererRef = useRef<PaperBallRenderer>(new PaperBallRenderer());
  const extendedPaperBallRendererRef = useRef<ExtendedPaperBallRenderer>(
    new ExtendedPaperBallRenderer()
  );
  const sequelPaperBallRendererRef = useRef<SequelPaperBallRenderer>(
    new SequelPaperBallRenderer()
  );
  const hoopRendererRef = useRef<HoopRenderer>(new HoopRenderer());
  const machineRendererRef = useRef<MachineRenderer>(new MachineRenderer());
  const popStageRendererRef = useRef<PopStageRenderer>(new PopStageRenderer());
  const trickShotRendererRef = useRef<TrickShotRenderer>(new TrickShotRenderer());
  const pingPongRendererRef = useRef<PingPongRenderer>(new PingPongRenderer());
  const dartShotRendererRef = useRef<DartShotRenderer>(new DartShotRenderer());
  const coinFlipRendererRef = useRef<CoinFlipRenderer>(new CoinFlipRenderer());
  const mindTrapsRendererRef = useRef<MindTrapsRenderer>(new MindTrapsRenderer());
  const runawayCakeRendererRef = useRef<RunawayCakeRenderer>(new RunawayCakeRenderer());
  const selfBuildingRobotRendererRef = useRef<SelfBuildingRobotRenderer>(new SelfBuildingRobotRenderer());
  const infiniteGiftBoxRendererRef = useRef<InfiniteGiftBoxRenderer>(new InfiniteGiftBoxRenderer());
  const livingTrafficLightRendererRef = useRef<LivingTrafficLightRenderer>(new LivingTrafficLightRenderer());
  const cloneButtonDisasterRendererRef = useRef<CloneButtonDisasterRenderer>(new CloneButtonDisasterRenderer());
  const rubberBandTrapRendererRef = useRef<RubberBandTrapRenderer>(new RubberBandTrapRenderer());
  const mysteryFloorHoleRendererRef = useRef<MysteryFloorHoleRenderer>(new MysteryFloorHoleRenderer());
  const superBouncyShoesRendererRef = useRef<SuperBouncyShoesRenderer>(new SuperBouncyShoesRenderer());
  const shadowTrickshotRendererRef = useRef<ShadowTrickshotRenderer>(new ShadowTrickshotRenderer());
  const invisibleWallRendererRef = useRef<InvisibleWallRenderer>(new InvisibleWallRenderer());
  const tenFanRendererRef = useRef<TenFanTrickshotRenderer>(new TenFanTrickshotRenderer());
  const hundredBallRendererRef = useRef<HundredBallChainRenderer>(new HundredBallChainRenderer());
  const longestRulerRendererRef = useRef<LongestRulerRenderer>(new LongestRulerRenderer());
  const giantSlinkyRendererRef = useRef<GiantSlinkyRenderer>(new GiantSlinkyRenderer());
  const impossibleKeyholeRendererRef = useRef<ImpossibleKeyholeRenderer>(new ImpossibleKeyholeRenderer());
  const impossibleLaserRendererRef = useRef<ImpossibleLaserRenderer>(new ImpossibleLaserRenderer());
  const impossiblePinballRendererRef = useRef<ImpossiblePinballRenderer>(new ImpossiblePinballRenderer());
  const hotShotRendererRef = useRef<ThousandDegreeHotShotRenderer>(new ThousandDegreeHotShotRenderer());
  const magneticMazeRendererRef = useRef<MagneticMazeRenderer>(new MagneticMazeRenderer());
  const spiralStaircaseRendererRef = useRef<SpiralStaircaseRenderer>(new SpiralStaircaseRenderer());
  const giantScissorRendererRef = useRef<GiantScissorRenderer>(new GiantScissorRenderer());
  const tripleGravityRendererRef = useRef<TripleGravityRenderer>(new TripleGravityRenderer());
  const invisibleTubeRendererRef = useRef<InvisibleTubeRenderer>(new InvisibleTubeRenderer());
  const giantGearRendererRef = useRef<GiantGearRenderer>(new GiantGearRenderer());
  const reverseBowlingRendererRef = useRef<ReverseBowlingRenderer>(new ReverseBowlingRenderer());
  const giantYoyoRendererRef = useRef<GiantYoyoRenderer>(new GiantYoyoRenderer());
  const [speed, setSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const lastTimeRef = useRef<number>(performance.now());
  const triggeredAudioCues = useRef<Set<string>>(new Set());

  const currentProject = PROJECTS[config.activeProject];
  const projectScenes = currentProject.scenes;
  const projectDuration = currentProject.duration;
  // The pop short burns its seven scene captions into the picture.
  const isPopProject = config.activeProject === 'pop-star';
  // So does the trick-shot short, which narrates what happens to him.
  const isTrickShotProject = config.activeProject === 'trick-shot-champion';
  // And the ping-pong short, whose six scene captions are burned in.
  const isPingPongProject = config.activeProject === 'ping-pong-revenge';
  // The dart short also burns its six captions into the picture.
  const isDartProject = config.activeProject === 'dart-shot';
  // And the coin-flip short, with gold-haloed captions.
  const isCoinFlipProject = config.activeProject === 'coin-flip';
  // The runaway cake short burns its five pop captions into the picture.
  const isRunawayCakeProject = config.activeProject === 'runaway-cake';
  // The self-building robot short burns its five pop captions into the picture.
  const isSelfBuildingRobotProject = config.activeProject === 'self-building-robot';
  // The infinite gift box short burns its five pop captions into the picture.
  const isInfiniteGiftBoxProject = config.activeProject === 'infinite-gift-box';
  // The living traffic light short burns its five pop captions into the picture.
  const isLivingTrafficLightProject = config.activeProject === 'living-traffic-light';
  // The clone button disaster short burns its five pop captions into the picture.
  const isCloneDisasterProject = config.activeProject === 'clone-button-disaster';
  // The giant rubber band trap short burns its five pop captions into the picture.
  const isRubberBandTrapProject = config.activeProject === 'rubber-band-trap';
  // The mystery hole in the floor short burns its five pop captions into the picture.
  const isMysteryFloorHoleProject = config.activeProject === 'mystery-floor-hole';
  // The super bouncy shoes short burns its five pop captions into the picture.
  const isSuperBouncyShoesProject = config.activeProject === 'super-bouncy-shoes';
  // The impossible shadow trickshot short burns its five pop captions into the picture.
  const isShadowTrickshotProject = config.activeProject === 'shadow-trickshot';
  // The invisible wall challenge short burns its five pop captions into the picture.
  const isInvisibleWallProject = config.activeProject === 'invisible-wall-challenge';
  // The 10-fan impossible trickshot short burns its five pop captions into the picture.
  const isTenFanProject = config.activeProject === 'ten-fan-trickshot';
  // The 100-ball chain reaction short burns its five pop captions into the picture.
  const isHundredBallProject = config.activeProject === 'hundred-ball-chain';
  // The world's longest ruler shot burns its five pop captions into the picture.
  const isLongestRulerProject = config.activeProject === 'longest-ruler-shot';
  // The giant slinky trickshot burns its five pop captions into the picture.
  const isGiantSlinkyProject = config.activeProject === 'giant-slinky-trickshot';
  // The impossible keyhole shot burns its five pop captions into the picture.
  const isImpossibleKeyholeProject = config.activeProject === 'impossible-keyhole-shot';
  // The impossible laser maze burns its five pop captions into the picture.
  const isImpossibleLaserProject = config.activeProject === 'impossible-laser-maze';
  // The impossible pinball trickshot burns its five pop captions into the picture.
  const isImpossiblePinballProject = config.activeProject === 'impossible-pinball-trickshot';
  // The 1,000-degree hot shot burns its five pop captions into the picture.
  const isHotShotProject = config.activeProject === 'thousand-degree-hot-shot';
  // The magnetic maze trickshot burns its five pop captions into the picture.
  const isMagneticMazeProject = config.activeProject === 'magnetic-maze-trickshot';
  // The spiral staircase trickshot burns its five pop captions into the picture.
  const isSpiralStaircaseProject = config.activeProject === 'spiral-staircase-shot';
  // The giant scissor trickshot burns its five pop captions into the picture.
  const isGiantScissorProject = config.activeProject === 'giant-scissor-trickshot';
  // The triple gravity trickshot burns its five pop captions into the picture.
  const isTripleGravityProject = config.activeProject === 'triple-gravity-trickshot';
  // The invisible tube trickshot burns its five pop captions into the picture.
  const isInvisibleTubeProject = config.activeProject === 'invisible-tube-trickshot';
  // The giant gear trickshot burns its five pop captions into the picture.
  const isGiantGearProject = config.activeProject === 'giant-gear-trickshot';
  // The reverse bowling trickshot burns its five pop captions into the picture.
  const isReverseBowlingProject = config.activeProject === 'reverse-bowling-trickshot';
  // The giant yo-yo trickshot burns its five pop captions into the picture.
  const isGiantYoyoProject = config.activeProject === 'giant-yoyo-trickshot';

  // Current active scene
  const activeScene =
    projectScenes.find(
      (s) => currentTime >= s.timeRange[0] && currentTime < s.timeRange[1]
    ) || projectScenes[projectScenes.length - 1];

  // Synchronize the cue set with a seek target: cues before the playhead are
  // considered spent, cues after it can fire again. This prevents every past
  // sound from firing at once after jumping to a later scene.
  const resetAudioCues = useCallback((toTime: number) => {
    const cues = triggeredAudioCues.current;
    const setCueState = (id: string, time: number) => {
      if (time <= toTime) cues.add(id);
      else cues.delete(id);
    };

    if (config.activeProject === 'giant-yoyo-trickshot') {
      for (const cue of GIANT_YOYO_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'reverse-bowling-trickshot') {
      for (const cue of REVERSE_BOWLING_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'giant-gear-trickshot') {
      for (const cue of GIANT_GEAR_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'invisible-tube-trickshot') {
      for (const cue of INVISIBLE_TUBE_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'triple-gravity-trickshot') {
      for (const cue of TRIPLE_GRAVITY_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'giant-scissor-trickshot') {
      for (const cue of GIANT_SCISSOR_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'spiral-staircase-shot') {
      for (const cue of SPIRAL_STAIRCASE_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'magnetic-maze-trickshot') {
      for (const cue of MAGNETIC_MAZE_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'thousand-degree-hot-shot') {
      for (const cue of HOT_SHOT_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'impossible-pinball-trickshot') {
      for (const cue of IMPOSSIBLE_PINBALL_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'impossible-laser-maze') {
      for (const cue of IMPOSSIBLE_LASER_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'impossible-keyhole-shot') {
      for (const cue of IMPOSSIBLE_KEYHOLE_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'giant-slinky-trickshot') {
      for (const cue of GIANT_SLINKY_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'longest-ruler-shot') {
      for (const cue of LONGEST_RULER_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'hundred-ball-chain') {
      for (const cue of HUNDRED_BALL_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'ten-fan-trickshot') {
      for (const cue of TEN_FAN_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'invisible-wall-challenge') {
      for (const cue of INVISIBLE_WALL_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'shadow-trickshot') {
      for (const cue of SHADOW_TRICKSHOT_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'super-bouncy-shoes') {
      for (const cue of SUPER_BOUNCY_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'mystery-floor-hole') {
      for (const cue of MYSTERY_HOLE_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'rubber-band-trap') {
      for (const cue of RUBBER_BAND_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'clone-button-disaster') {
      for (const cue of CLONE_DISASTER_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'living-traffic-light') {
      for (const cue of LIVING_TRAFFIC_LIGHT_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'infinite-gift-box') {
      for (const cue of INFINITE_GIFT_BOX_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'self-building-robot') {
      for (const cue of SELF_BUILDING_ROBOT_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'runaway-cake') {
      for (const cue of RUNAWAY_CAKE_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'mind-traps') {
      for (const cue of MIND_TRAPS_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'paper-ball-30') {
      for (const cue of PAPER_BALL_30_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'paper-ball-sequel') {
      for (const cue of PAPER_BALL_SEQUEL_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'paper-ball-part3') {
      for (const cue of PAPER_BALL_PART3_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'paper-ball-part4') {
      for (const cue of PAPER_BALL_PART4_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'pop-star') {
      for (const cue of POP_STAR_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'trick-shot-champion') {
      for (const cue of TRICK_SHOT_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'ping-pong-revenge') {
      for (const cue of PING_PONG_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'dart-shot') {
      for (const cue of DART_SHOT_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'coin-flip') {
      for (const cue of COIN_FLIP_CUES) setCueState(cue.id, cue.time);
      return;
    }

    if (config.activeProject === 'paper-ball') {
      (
        [
          ['toss', 2.0],
          ['rim', 4.4],
          ['lamp', 6.0],
          ['fan', 7.5],
          ['wall', 8.6],
          ['bonk', 9.4],
          ['plop', 9.6],
        ] as const
      ).forEach(([id, time]) => setCueState(id, time));
      return;
    }

    (
      [
        ['step1', 0.4],
        ['step2', 0.8],
        ['skip', 1.2],
        ['scratch', 2.0],
        ['paper', 4.5],
        ['tap1', 5.05],
        ['tap2', 5.25],
        ['thump', 6.1],
        ['squeak', 6.3],
        ['trombone', 8.0],
        ['vo1', 0.1],
        ['vo2', 8.0],
      ] as const
    ).forEach(([id, time]) => setCueState(id, time));
  }, [config.activeProject]);

  // Audio triggering checks during playback
  const checkAudioTriggers = useCallback(
    (t: number) => {
      if (!config.enableSFX && !config.enableVoiceOver) return;
      const cues = triggeredAudioCues.current;

      if (config.activeProject === 'paper-ball-30') {
        if (!config.enableSFX) return;
        for (const cue of PAPER_BALL_30_CUES) {
          if (t >= cue.time && !cues.has(cue.id)) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'paper-ball-sequel') {
        if (!config.enableSFX) return;
        for (const cue of PAPER_BALL_SEQUEL_CUES) {
          if (t >= cue.time && !cues.has(cue.id)) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'paper-ball-part3') {
        if (!config.enableSFX) return;
        for (const cue of PAPER_BALL_PART3_CUES) {
          if (t >= cue.time && !cues.has(cue.id)) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'paper-ball-part4') {
        if (!config.enableSFX) return;
        for (const cue of PAPER_BALL_PART4_CUES) {
          if (t >= cue.time && !cues.has(cue.id)) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'pop-star') {
        if (!config.enableSFX) return;
        for (const cue of POP_STAR_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('pop-track-')) {
            // A music section only starts inside its own window, so seeking
            // forward does not stack every section on top of each other.
            if (t >= cue.time && t < cue.time + 7.3) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          // Short accents only fire just after their mark, never in a burst.
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'giant-yoyo-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of GIANT_YOYO_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('gyt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'reverse-bowling-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of REVERSE_BOWLING_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('rbt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'giant-gear-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of GIANT_GEAR_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('ggt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'invisible-tube-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of INVISIBLE_TUBE_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('itt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'triple-gravity-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of TRIPLE_GRAVITY_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('tgt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'giant-scissor-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of GIANT_SCISSOR_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('gsc-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'spiral-staircase-shot') {
        if (!config.enableSFX) return;
        for (const cue of SPIRAL_STAIRCASE_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('sss-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'magnetic-maze-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of MAGNETIC_MAZE_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('mmt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'thousand-degree-hot-shot') {
        if (!config.enableSFX) return;
        for (const cue of HOT_SHOT_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('hts-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'impossible-pinball-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of IMPOSSIBLE_PINBALL_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('ipt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'impossible-laser-maze') {
        if (!config.enableSFX) return;
        for (const cue of IMPOSSIBLE_LASER_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('ilm-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'impossible-keyhole-shot') {
        if (!config.enableSFX) return;
        for (const cue of IMPOSSIBLE_KEYHOLE_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('iks-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'giant-slinky-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of GIANT_SLINKY_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('gst-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'longest-ruler-shot') {
        if (!config.enableSFX) return;
        for (const cue of LONGEST_RULER_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('lrs-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'hundred-ball-chain') {
        if (!config.enableSFX) return;
        for (const cue of HUNDRED_BALL_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('hbc-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'ten-fan-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of TEN_FAN_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('tft-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'invisible-wall-challenge') {
        if (!config.enableSFX) return;
        for (const cue of INVISIBLE_WALL_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('iwc-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'shadow-trickshot') {
        if (!config.enableSFX) return;
        for (const cue of SHADOW_TRICKSHOT_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('sts-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'super-bouncy-shoes') {
        if (!config.enableSFX) return;
        for (const cue of SUPER_BOUNCY_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('sbs-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'mystery-floor-hole') {
        if (!config.enableSFX) return;
        for (const cue of MYSTERY_HOLE_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('mfh-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'rubber-band-trap') {
        if (!config.enableSFX) return;
        for (const cue of RUBBER_BAND_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('rbt-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'clone-button-disaster') {
        if (!config.enableSFX) return;
        for (const cue of CLONE_DISASTER_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('cbd-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'living-traffic-light') {
        if (!config.enableSFX) return;
        for (const cue of LIVING_TRAFFIC_LIGHT_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('ltl-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'infinite-gift-box') {
        if (!config.enableSFX) return;
        for (const cue of INFINITE_GIFT_BOX_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('igb-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'self-building-robot') {
        if (!config.enableSFX) return;
        for (const cue of SELF_BUILDING_ROBOT_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('sbr-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'runaway-cake') {
        if (!config.enableSFX) return;
        for (const cue of RUNAWAY_CAKE_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('rc-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'trick-shot-champion') {
        if (!config.enableSFX) return;
        for (const cue of TRICK_SHOT_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('ts-score-')) {
            // The score is scheduled in sections so a seek never stacks them.
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'ping-pong-revenge') {
        if (!config.enableSFX) return;
        for (const cue of PING_PONG_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('pp-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'dart-shot') {
        if (!config.enableSFX) return;
        for (const cue of DART_SHOT_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('ds-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'mind-traps') {
        if (!config.enableSFX) return;
        for (const cue of MIND_TRAPS_CUES) {
          if (cues.has(cue.id)) continue;
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'coin-flip') {
        if (!config.enableSFX) return;
        for (const cue of COIN_FLIP_CUES) {
          if (cues.has(cue.id)) continue;
          if (cue.id.startsWith('cf-score-')) {
            if (t >= cue.time && t < cue.time + 7.6) {
              cue.play();
              cues.add(cue.id);
            }
            continue;
          }
          if (t >= cue.time && t - cue.time < 0.75) {
            cue.play();
            cues.add(cue.id);
          }
        }
        return;
      }

      if (config.activeProject === 'paper-ball') {
        if (!config.enableSFX) return;
        if (t >= 2.0 && !cues.has('toss')) {
          soundEngine.playWhoosh();
          cues.add('toss');
        }
        if (t >= 4.4 && !cues.has('rim')) {
          soundEngine.playRimClink();
          cues.add('rim');
        }
        if (t >= 6.0 && !cues.has('lamp')) {
          soundEngine.playLampDing();
          cues.add('lamp');
        }
        if (t >= 7.5 && !cues.has('fan')) {
          soundEngine.playFanWhack();
          cues.add('fan');
        }
        if (t >= 8.6 && !cues.has('wall')) {
          soundEngine.playWallBounce();
          cues.add('wall');
        }
        if (t >= 9.4 && !cues.has('bonk')) {
          soundEngine.playHeadBonk();
          cues.add('bonk');
        }
        if (t >= 9.6 && !cues.has('plop')) {
          soundEngine.playDeskPlop();
          cues.add('plop');
        }
        return;
      }

      // Shadow Quit project audio
      if (config.enableSFX) {
        if (t >= 0.4 && !cues.has('step1')) {
          soundEngine.playFootstep(false);
          cues.add('step1');
        }
        if (t >= 0.8 && !cues.has('step2')) {
          soundEngine.playFootstep(false);
          cues.add('step2');
        }
        if (t >= 1.2 && !cues.has('skip')) {
          soundEngine.playFootstep(true);
          cues.add('skip');
        }
        if (t >= 2.0 && !cues.has('scratch')) {
          soundEngine.playRecordScratch();
          cues.add('scratch');
        }
        if (t >= 4.5 && !cues.has('paper')) {
          soundEngine.playPaperSlap();
          cues.add('paper');
        }
        if (t >= 5.05 && !cues.has('tap1')) {
          soundEngine.playClipboardTap();
          cues.add('tap1');
        }
        if (t >= 5.25 && !cues.has('tap2')) {
          soundEngine.playClipboardTap();
          cues.add('tap2');
        }
        if (t >= 6.1 && !cues.has('thump')) {
          soundEngine.playFloorThump();
          cues.add('thump');
        }
        if (t >= 6.3 && !cues.has('squeak')) {
          soundEngine.playArmCrossSqueak();
          cues.add('squeak');
        }
        if (t >= 8.0 && !cues.has('trombone')) {
          soundEngine.playSadTrombone();
          cues.add('trombone');
        }
      }

      if (config.enableVoiceOver) {
        if (t >= 0.1 && t < 0.3 && !cues.has('vo1')) {
          speakVoiceOver(config.customVO1, {
            rate: config.voiceRate,
            pitch: config.voicePitch,
            volume: config.voiceVolume,
          });
          cues.add('vo1');
        }
        if (t >= 8.0 && t < 8.3 && !cues.has('vo2')) {
          speakVoiceOver(config.customVO2, {
            rate: config.voiceRate,
            pitch: config.voicePitch,
            volume: config.voiceVolume,
          });
          cues.add('vo2');
        }
      }
    },
    [config]
  );

  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;

  // Switching projects or audio toggles starts a fresh cue state at the
  // current playhead, so seeking never dumps a stack of old sounds.
  useEffect(() => {
    triggeredAudioCues.current.clear();
    resetAudioCues(currentTimeRef.current);
  }, [config.activeProject, config.enableSFX, config.enableVoiceOver, resetAudioCues]);

  // Main animation render loop
  useEffect(() => {
    let animId: number;

    const renderLoop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        const prev = currentTimeRef.current;
        let nextTime = prev + delta * speed;
        if (nextTime >= projectDuration) {
          if (isLooping) {
            nextTime = 0.0;
            resetAudioCues(0.0);
          } else {
            nextTime = projectDuration;
            setIsPlaying(false);
          }
        }
        currentTimeRef.current = nextTime;
        setCurrentTime(nextTime);
        checkAudioTriggers(nextTime);
      }

      // Render to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const t = currentTimeRef.current;
          let renderTime = t;
          if (config.fpsMode === 24) {
            renderTime = Math.floor(t * 24) / 24;
          }

          if (config.activeProject === 'giant-yoyo-trickshot') {
            giantYoyoRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'reverse-bowling-trickshot') {
            reverseBowlingRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'giant-gear-trickshot') {
            giantGearRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'invisible-tube-trickshot') {
            invisibleTubeRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'triple-gravity-trickshot') {
            tripleGravityRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'giant-scissor-trickshot') {
            giantScissorRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'spiral-staircase-shot') {
            spiralStaircaseRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'magnetic-maze-trickshot') {
            magneticMazeRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'thousand-degree-hot-shot') {
            hotShotRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'impossible-pinball-trickshot') {
            impossiblePinballRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'impossible-laser-maze') {
            impossibleLaserRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'impossible-keyhole-shot') {
            impossibleKeyholeRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'giant-slinky-trickshot') {
            giantSlinkyRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'longest-ruler-shot') {
            longestRulerRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'hundred-ball-chain') {
            hundredBallRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'ten-fan-trickshot') {
            tenFanRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'invisible-wall-challenge') {
            invisibleWallRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'shadow-trickshot') {
            shadowTrickshotRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'super-bouncy-shoes') {
            superBouncyShoesRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'mystery-floor-hole') {
            mysteryFloorHoleRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'rubber-band-trap') {
            rubberBandTrapRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'clone-button-disaster') {
            cloneButtonDisasterRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'living-traffic-light') {
            livingTrafficLightRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'infinite-gift-box') {
            infiniteGiftBoxRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'self-building-robot') {
            selfBuildingRobotRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'runaway-cake') {
            runawayCakeRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'mind-traps') {
            mindTrapsRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'paper-ball-30') {
            extendedPaperBallRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'paper-ball-sequel') {
            sequelPaperBallRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'paper-ball-part3') {
            hoopRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'paper-ball-part4') {
            machineRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'pop-star') {
            popStageRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'trick-shot-champion') {
            trickShotRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'ping-pong-revenge') {
            pingPongRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'dart-shot') {
            dartShotRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'coin-flip') {
            coinFlipRendererRef.current.render(ctx, renderTime, config);
          } else if (config.activeProject === 'paper-ball') {
            paperBallRendererRef.current.render(ctx, renderTime, config);
          } else {
            shadowRendererRef.current.render(ctx, renderTime, config);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, isLooping, projectDuration, config, checkAudioTriggers, resetAudioCues, setCurrentTime, setIsPlaying]);

  // Spacebar toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-1 / 24);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(1 / 24);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying, projectDuration, resetAudioCues]);

  const seekRelative = (deltaSec: number) => {
    setCurrentTime((prev) => {
      const target = Math.max(0, Math.min(projectDuration, prev + deltaSec));
      resetAudioCues(target);
      return target;
    });
  };

  const jumpToScene = (scene: SceneDef) => {
    setCurrentTime(scene.timeRange[0]);
    resetAudioCues(scene.timeRange[0]);
  };

  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefix =
      config.activeProject === 'giant-yoyo-trickshot'
        ? 'giant-yoyo-trickshot'
        : config.activeProject === 'reverse-bowling-trickshot'
        ? 'reverse-bowling-trickshot'
        : config.activeProject === 'giant-gear-trickshot'
        ? 'giant-gear-trickshot'
        : config.activeProject === 'invisible-tube-trickshot'
        ? 'invisible-tube-trickshot'
        : config.activeProject === 'triple-gravity-trickshot'
        ? 'triple-gravity-trickshot'
        : config.activeProject === 'giant-scissor-trickshot'
        ? 'giant-scissor-trickshot'
        : config.activeProject === 'spiral-staircase-shot'
        ? 'spiral-staircase-shot'
        : config.activeProject === 'magnetic-maze-trickshot'
        ? 'magnetic-maze-trickshot'
        : config.activeProject === 'thousand-degree-hot-shot'
        ? 'thousand-degree-hot-shot'
        : config.activeProject === 'impossible-pinball-trickshot'
        ? 'impossible-pinball-trickshot'
        : config.activeProject === 'impossible-laser-maze'
        ? 'impossible-laser-maze'
        : config.activeProject === 'impossible-keyhole-shot'
        ? 'impossible-keyhole-shot'
        : config.activeProject === 'giant-slinky-trickshot'
        ? 'giant-slinky-trickshot'
        : config.activeProject === 'longest-ruler-shot'
        ? 'longest-ruler-shot'
        : config.activeProject === 'hundred-ball-chain'
        ? 'hundred-ball-chain'
        : config.activeProject === 'ten-fan-trickshot'
        ? 'ten-fan-trickshot'
        : config.activeProject === 'invisible-wall-challenge'
        ? 'invisible-wall-challenge'
        : config.activeProject === 'shadow-trickshot'
        ? 'shadow-trickshot'
        : config.activeProject === 'super-bouncy-shoes'
        ? 'super-bouncy-shoes'
        : config.activeProject === 'mystery-floor-hole'
        ? 'mystery-floor-hole'
        : config.activeProject === 'rubber-band-trap'
        ? 'rubber-band-trap'
        : config.activeProject === 'clone-button-disaster'
        ? 'clone-button-disaster'
        : config.activeProject === 'living-traffic-light'
        ? 'living-traffic-light'
        : config.activeProject === 'infinite-gift-box'
        ? 'infinite-gift-box'
        : config.activeProject === 'self-building-robot'
        ? 'self-building-robot'
        : config.activeProject === 'runaway-cake'
        ? 'runaway-cake'
        : config.activeProject === 'shadow-quit'
        ? 'shadow-quit'
        : config.activeProject === 'trick-shot-champion'
        ? 'trick-shot-champion'
        : config.activeProject === 'pop-star'
        ? 'max-rex-beep'
        : config.activeProject === 'paper-ball-part4'
        ? 'paper-ball-part4'
        : config.activeProject === 'paper-ball-part3'
        ? 'paper-ball-part3'
        : config.activeProject === 'paper-ball-sequel'
        ? 'paper-ball-ricochet-ep2'
        : config.activeProject === 'paper-ball-30'
        ? 'paper-ball-ricochet-30s'
        : 'paper-ball';
    const link = document.createElement('a');
    link.download = `${prefix}-${currentTime.toFixed(2)}s.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const currentFrame = Math.floor(currentTime * 24);
  const totalFrames = Math.round(projectDuration * 24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        {/* Scene Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {projectScenes.map((s) => {
            const isCur = currentTime >= s.timeRange[0] && currentTime < s.timeRange[1];
            return (
              <button
                key={s.id}
                onClick={() => jumpToScene(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isCur
                    ? 'bg-white text-zinc-950 font-bold shadow-sm ring-1 ring-white/20'
                    : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {s.name}: {s.title}
              </button>
            );
          })}
        </div>

        {/* Studio Overlays & Snapshot */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfig({ ...config, showSafeZones: !config.showSafeZones })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              config.showSafeZones
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>9:16 Safe Areas</span>
          </button>

          <button
            onClick={() => setConfig({ ...config, fpsMode: config.fpsMode === 24 ? 60 : 24 })}
            className="px-3 py-1.5 text-xs font-mono bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Toggle authentic 24fps cartoon step vs 60fps interpolation"
          >
            {config.fpsMode} FPS
          </button>

          <button
            onClick={takeSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-950 text-zinc-200 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Download 1080x1920 PNG snapshot of current frame"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snapshot</span>
          </button>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Export 1080x1920 MP4/WebM with custom speed & synchronized audio"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Stage: Vertical 9:16 Frame + Director Details Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 9:16 Mobile Animation Screen */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[380px] aspect-[9/16] bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-800 ring-1 ring-slate-700/50">
            {/* Top Phone Camera Notch indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* High-Resolution HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full h-full object-contain select-none cursor-pointer"
              onClick={() => setIsPlaying((p) => !p)}
            />

            {/* In-Frame Pause Indicator overlay if stopped */}
            {!isPlaying && (
              <div
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-black/70 group-hover:bg-white group-hover:text-zinc-950 flex items-center justify-center text-white shadow-lg transition-all transform group-hover:scale-110">
                  <Play className="w-7 h-7 ml-1" />
                </div>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-2 font-mono">1080 Ã— 1920 (9:16 Vertical)</span>
        </div>

        {/* Right Column: Interactive Director Desk & Timeline */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Scene Monitor Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400">Current Scene Beat</span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {activeScene.name}: {activeScene.title}
                </h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-white">
                  {currentTime.toFixed(2)}s{' '}
                  <span className="text-zinc-500 text-xs">/ {projectDuration.toFixed(2)}s</span>
                </div>
                <div className="text-xs text-zinc-500">
                  Frame {currentFrame}{' '}
                  <span className="text-zinc-600 text-[10px]">/ {totalFrames}</span>
                </div>
              </div>
            </div>

            {/* Animated Progress Track */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max={projectDuration}
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  resetAudioCues(val);
                }}
                className="w-full accent-white cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />

              {/* Scene cut markers below the progress bar */}
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-0.5">
                {projectScenes.map((scene) => (
                  <span key={scene.id}>{scene.timeRange[0].toFixed(0)}s</span>
                ))}
                <span>{projectDuration}s</span>
              </div>
            </div>

            {/* Transport Button Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    resetAudioCues(0);
                    setIsPlaying(true);
                  }}
                  title="Restart"
                  className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => seekRelative(-1 / 24)}
                  title="Previous Frame (Left Arrow)"
                  className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => seekRelative(1 / 24)}
                  title="Next Frame (Right Arrow)"
                  className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isLooping
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                  }`}
                >
                  Loop
                </button>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {[0.5, 0.75, 1.0, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                      speed === s
                        ? 'bg-white text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title={
                      s === 0.5
                        ? 'Slow-Mo Comedy (0.5x)'
                        : s === 0.75
                        ? 'Relaxed Comedy (0.75x)'
                        : `${s}x Speed`
                    }
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Sync Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Live Pantomime Description</span>
              <span className="text-zinc-400 font-mono">Synced to current frame</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 font-mono text-xs">
              {activeScene.videoPrompt}
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
                <div className="text-slate-400 font-medium">Stick Figure Reaction</div>
                <div className="text-slate-200 mt-0.5">{activeScene.characterAction}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
                <div className="text-slate-400 font-medium">
                  {activeScene.propAction ? 'Prop & Physics Action' : 'Shadow Behavior'}
                </div>
                <div className="text-slate-200 mt-0.5">
                  {activeScene.propAction ?? activeScene.shadowAction}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Audio & Caption Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                if (currentProject.hasAudioDialogue) {
                  setConfig({ ...config, enableVoiceOver: !config.enableVoiceOver });
                }
              }}
              disabled={!currentProject.hasAudioDialogue}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                !currentProject.hasAudioDialogue
                  ? 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                  : config.enableVoiceOver
                  ? 'bg-slate-900 border-slate-700 text-white cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-500 cursor-pointer'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-semibold">Voice-Over</div>
                <div className="text-[11px] text-slate-400">
                  {currentProject.hasAudioDialogue ? 'Deadpan narrator' : 'No dialogue film'}
                </div>
              </div>
              <span
                className={`text-xs font-mono ${
                  !currentProject.hasAudioDialogue
                    ? 'text-slate-600'
                    : config.enableVoiceOver
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {!currentProject.hasAudioDialogue ? 'N/A' : config.enableVoiceOver ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setConfig({ ...config, enableSFX: !config.enableSFX })}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                config.enableSFX
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-semibold">Cartoon SFX</div>
                <div className="text-[11px] text-slate-400">
                  {config.activeProject === 'giant-yoyo-trickshot'
                    ? '138 BPM arcade score, giant yo-yo whirs, forehead bonk, cup rim clink, triple hoop chimes, recoil waist hoist & floor beanie spin'
                    : config.activeProject === 'reverse-bowling-trickshot'
                    ? '136 BPM bowling score, wood lane rumble, mirror pings, spring ramp boing, 10-pin strike crash & pin head bonk'
                    : config.activeProject === 'giant-gear-trickshot'
                    ? '138 BPM clockwork score, interlocking gear whirs, metallic tooth clinks, spring launcher boing, golden cup clink & reverse clutch'
                    : config.activeProject === 'invisible-tube-trickshot'
                    ? '136 BPM score, hollow tube pops, pneumatic loop whooshes, Air Pump blast/reverse, cup clink & beanie bonk'
                    : config.activeProject === 'triple-gravity-trickshot'
                    ? '136 BPM sci-fi score, gravity zone hums, floating platform boing, golden hoop swish & triple overload surge'
                    : config.activeProject === 'giant-scissor-trickshot'
                    ? '136 BPM trickshot score, metallic scissor snips, domino clacks, seesaw & spring launcher boings, string snap & hat snip'
                    : config.activeProject === 'spiral-staircase-shot'
                    ? '138 BPM arcade score, spiral step ticks, rotating platform boings, hoop swish, carousel motor spin & basket drop'
                    : config.activeProject === 'magnetic-maze-trickshot'
                    ? '136 BPM sci-fi score, electromagnetic hums, metal clanks, forehead bonk, all-magnets overload & chair slam'
                    : config.activeProject === 'thousand-degree-hot-shot'
                    ? '138 BPM heat-lab score, steam melt sizzles, spinning ring chimes, springboard boing, red-hot cup launch & beanie pats'
                    : config.activeProject === 'impossible-pinball-trickshot'
                    ? 'Arcade pinball score, plunger twangs, bumper chimes, flipper snap, jackpot & spring launch'
                    : config.activeProject === 'impossible-laser-maze'
                    ? 'Spy-heist score, laser barrier zaps, mirror reflection pings, cup switch & red laser cage alarm'
                    : config.activeProject === 'impossible-keyhole-shot'
                    ? 'Pop score, keyhole rim clink, mirror pings, curved ramp swoosh, door slam & beanie swish'
                    : config.activeProject === 'giant-slinky-trickshot'
                    ? 'Pop score, metallic slinky twangs, wall bounces, cup swish, spring-cage boings & trombone sting'
                    : config.activeProject === 'longest-ruler-shot'
                    ? 'Pop score, ruler flicks, snap clicks, book bounce, trampoline boing, swish & catapult sting'
                    : config.activeProject === 'hundred-ball-chain'
                    ? 'Arcade score, domino clacks, seesaw boings, loop, hoop swish & 100-ball avalanche'
                    : config.activeProject === 'ten-fan-trickshot'
                    ? 'Pop score, 10-fan whooshes, head bonks, wall bounce, giant gust & cup drop'
                    : config.activeProject === 'invisible-wall-challenge'
                    ? 'Pop score, glass wall pings, rim clink, net swish, face slam & squeak'
                    : config.activeProject === 'shadow-trickshot'
                    ? 'Spy score, shadow swooshes, spotlight flicker, cup clink, bonk'
                    : config.activeProject === 'super-bouncy-shoes'
                    ? 'Pop comedy score, sneaker spring boings, trampoline rocket, pillow thud, bonk'
                    : config.activeProject === 'mystery-floor-hole'
                    ? 'Mystery score, portal bloops, giant eruptions, duck squeak, smash'
                    : config.activeProject === 'rubber-band-trap'
                    ? 'Comedy score, band stretch, wood snap, cushion boings, beanie flick'
                    : config.activeProject === 'clone-button-disaster'
                    ? 'Comedy score, button clicks, clone pops, reset flash, scream'
                    : config.activeProject === 'living-traffic-light'
                    ? 'Street score, blinks, STOP snaps, blackout, red alarm'
                    : config.activeProject === 'infinite-gift-box'
                    ? 'Comedy score, ribbon pulls, box pops, fountain'
                    : config.activeProject === 'self-building-robot'
                    ? 'Workshop score, laser scans, servos, power surge'
                    : config.activeProject === 'runaway-cake'
                    ? 'Pop cartoon score, spring boings, splats, confetti'
                    : config.activeProject === 'paper-ball-30'
                    ? 'Whooshes, beeps, heartbeat'
                    : config.activeProject === 'paper-ball-sequel'
                    ? 'Rumble, bonks, clicks, fanfare'
                    : config.activeProject === 'paper-ball-part3'
                    ? 'March, squeaks, boings, swish'
                    : config.activeProject === 'paper-ball-part4'
                    ? 'Bonks, machine clatter, swish'
                    : config.activeProject === 'pop-star'
                    ? 'Pop track, crowd, robot bleeps'
                    : config.activeProject === 'trick-shot-champion'
                    ? 'Epic score, rim clanks, crowd'
                    : config.activeProject === 'ping-pong-revenge'
                    ? 'Comedy score, bonks, cup clink'
                    : config.activeProject === 'dart-shot'
                    ? 'Comedy score, dart thunks, clock'
                    : config.activeProject === 'coin-flip'
                    ? 'Comedy score, coin tings, splashes'
                    : config.activeProject === 'paper-ball'
                    ? 'Whack, bonk, clink'
                    : 'Scratch, taps, horn'}
                </div>
              </div>
              <span className={`text-xs font-mono ${config.enableSFX ? 'text-emerald-400' : 'text-slate-600'}`}>
                {config.enableSFX ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                if (
                  currentProject.hasCaptions &&
                  !isPopProject &&
                  !isTrickShotProject &&
                  !isPingPongProject &&
                  !isDartProject &&
                  !isCoinFlipProject &&
                  !isRunawayCakeProject &&
                  !isSelfBuildingRobotProject &&
                  !isInfiniteGiftBoxProject &&
                  !isLivingTrafficLightProject &&
                  !isCloneDisasterProject &&
                  !isRubberBandTrapProject &&
                  !isMysteryFloorHoleProject &&
                  !isSuperBouncyShoesProject &&
                  !isShadowTrickshotProject &&
                  !isInvisibleWallProject &&
                  !isTenFanProject &&
                  !isHundredBallProject &&
                  !isLongestRulerProject &&
                  !isGiantSlinkyProject &&
                  !isImpossibleKeyholeProject &&
                  !isImpossibleLaserProject &&
                  !isImpossiblePinballProject &&
                  !isHotShotProject &&
                  !isMagneticMazeProject &&
                  !isSpiralStaircaseProject &&
                  !isGiantScissorProject &&
                  !isTripleGravityProject &&
                  !isInvisibleTubeProject &&
                  !isGiantGearProject &&
                  !isReverseBowlingProject &&
                  !isGiantYoyoProject
                ) {
                  setConfig({ ...config, showCaptions: !config.showCaptions });
                }
              }}
              disabled={!currentProject.hasCaptions || isPopProject || isTrickShotProject || isPingPongProject || isDartProject || isCoinFlipProject || isRunawayCakeProject || isSelfBuildingRobotProject || isInfiniteGiftBoxProject || isLivingTrafficLightProject || isCloneDisasterProject || isRubberBandTrapProject || isMysteryFloorHoleProject || isSuperBouncyShoesProject || isShadowTrickshotProject || isInvisibleWallProject || isTenFanProject || isHundredBallProject || isLongestRulerProject || isGiantSlinkyProject || isImpossibleKeyholeProject || isImpossibleLaserProject || isImpossiblePinballProject || isHotShotProject || isMagneticMazeProject || isSpiralStaircaseProject || isGiantScissorProject || isTripleGravityProject || isInvisibleTubeProject || isGiantGearProject || isReverseBowlingProject || isGiantYoyoProject}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                !currentProject.hasCaptions || isPopProject || isTrickShotProject || isPingPongProject || isDartProject || isCoinFlipProject || isRunawayCakeProject || isSelfBuildingRobotProject || isInfiniteGiftBoxProject || isLivingTrafficLightProject || isCloneDisasterProject || isRubberBandTrapProject || isMysteryFloorHoleProject || isSuperBouncyShoesProject || isShadowTrickshotProject || isInvisibleWallProject || isTenFanProject || isHundredBallProject || isLongestRulerProject || isGiantSlinkyProject || isImpossibleKeyholeProject || isImpossibleLaserProject || isImpossiblePinballProject || isHotShotProject || isMagneticMazeProject || isSpiralStaircaseProject || isGiantScissorProject || isTripleGravityProject || isInvisibleTubeProject || isGiantGearProject || isReverseBowlingProject || isGiantYoyoProject
                  ? 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                  : config.showCaptions
                  ? 'bg-slate-900 border-slate-700 text-white cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-500 cursor-pointer'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-semibold">In-Video Captions</div>
                <div className="text-[11px] text-slate-400">
                  {(isPingPongProject || isDartProject || isCoinFlipProject || isRunawayCakeProject || isSelfBuildingRobotProject || isInfiniteGiftBoxProject || isLivingTrafficLightProject || isCloneDisasterProject || isRubberBandTrapProject || isMysteryFloorHoleProject || isSuperBouncyShoesProject || isShadowTrickshotProject || isInvisibleWallProject || isTenFanProject || isHundredBallProject || isLongestRulerProject || isGiantSlinkyProject || isImpossibleKeyholeProject || isImpossibleLaserProject || isImpossiblePinballProject || isHotShotProject || isMagneticMazeProject || isSpiralStaircaseProject || isGiantScissorProject || isTripleGravityProject || isInvisibleTubeProject || isGiantGearProject || isReverseBowlingProject || isGiantYoyoProject)
                    ? 'Burned-in scene captions'
                    : isPopProject || isTrickShotProject
                    ? 'Burned-in narration captions'
                    : currentProject.hasCaptions
                    ? 'Opening & End-card'
                    : 'No text constraint'}
                </div>
              </div>
              <span
                className={`text-xs font-mono ${
                  isPopProject || isTrickShotProject || isPingPongProject || isDartProject || isCoinFlipProject || isRunawayCakeProject || isSelfBuildingRobotProject || isInfiniteGiftBoxProject || isLivingTrafficLightProject || isCloneDisasterProject || isRubberBandTrapProject || isMysteryFloorHoleProject || isSuperBouncyShoesProject || isShadowTrickshotProject || isInvisibleWallProject || isTenFanProject || isHundredBallProject || isLongestRulerProject || isGiantSlinkyProject || isImpossibleKeyholeProject || isImpossibleLaserProject || isImpossiblePinballProject || isHotShotProject || isMagneticMazeProject || isSpiralStaircaseProject || isGiantScissorProject || isTripleGravityProject || isInvisibleTubeProject || isGiantGearProject || isReverseBowlingProject || isGiantYoyoProject
                    ? 'text-emerald-400'
                    : !currentProject.hasCaptions
                    ? 'text-slate-600'
                    : config.showCaptions
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {isPopProject || isTrickShotProject || isPingPongProject || isDartProject || isCoinFlipProject || isRunawayCakeProject || isSelfBuildingRobotProject || isInfiniteGiftBoxProject || isLivingTrafficLightProject || isCloneDisasterProject || isRubberBandTrapProject || isMysteryFloorHoleProject || isSuperBouncyShoesProject || isShadowTrickshotProject || isInvisibleWallProject || isTenFanProject || isHundredBallProject || isLongestRulerProject || isGiantSlinkyProject || isImpossibleKeyholeProject || isImpossibleLaserProject || isImpossiblePinballProject || isHotShotProject || isMagneticMazeProject || isSpiralStaircaseProject || isGiantScissorProject || isTripleGravityProject || isInvisibleTubeProject || isGiantGearProject || isReverseBowlingProject || isGiantYoyoProject
                  ? 'ON'
                  : !currentProject.hasCaptions
                  ? 'NONE'
                  : config.showCaptions
                  ? 'ON'
                  : 'OFF'}
              </span>
            </button>
          </div>

          {/* YouTube Title & Shorts Copy Section */}
          <YouTubeMetaCard project={currentProject} compact />
        </div>
      </div>
    </div>
  );
};
