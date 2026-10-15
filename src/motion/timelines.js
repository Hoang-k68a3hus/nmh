import { gsap } from 'gsap';
import { mountEnvelope3DScene } from '../graphics/svg/envelope3d.js';

const ENVELOPE_TIME_SCALE = 0.65;

/**
 * Tạo timeline điều khiển trải nghiệm mở phong bì 3D (kèm fallback SVG an toàn).
 * Bảo toàn nguyên vẹn chữ ký hàm: createEnvelopeTimeline(svg, { onComplete }) -> { play, dispose }
 */
export function createEnvelopeTimeline(svg, { onComplete, scrollDriven = false } = {}) {
  const stage3D = mountEnvelope3DScene(svg, { scrollDriven });

  // Trường hợp hỗ trợ WebGL: Chạy trải nghiệm 3D Editorial Paper Art
  if (stage3D) {
    const timeline = stage3D.buildRevealTimeline({ onComplete });
    timeline.timeScale(ENVELOPE_TIME_SCALE);
    let hasCompleted = false;

    return {
      setProgress: (value, reduced = false) => {
        timeline.progress(value, true).pause();
        stage3D.setScrollPose(value, reduced);
        stage3D.renderFrame();
      },
      play: () => {
        if (timeline.isActive()) return timeline;
        if (hasCompleted) {
          timeline.play(0);
          return timeline;
        }
        timeline.eventCallback('onComplete', () => {
          hasCompleted = true;
          stage3D.renderFrame();
          if (typeof onComplete === 'function') onComplete();
        });
        return timeline.play(0);
      },
      dispose: () => {
        timeline.kill();
        stage3D.dispose({ preserveFrame: hasCompleted });
      },
    };
  }

  // Fallback khi WebGL bị tắt: Sử dụng SVG timeline đã tinh chỉnh (không còn lỗi lật nắp 2D thô)
  let timeline;
  const context = gsap.context(() => {
    const part = (name) => svg.querySelector(`[data-part="${name}"]`);
    timeline = gsap.timeline({
      paused: true,
      onComplete,
      defaults: { ease: 'power2.out' },
    });

    timeline
      .to(
        part('seal'),
        { y: 14, rotation: 10, svgOrigin: '270 259', opacity: 0, duration: 0.28 },
        0
      )
      .to(part('ribbon'), { opacity: 0, duration: 0.28 }, 0)
      .to(
        part('flap'),
        {
          scaleY: -1,
          svgOrigin: '270 180',
          duration: 0.72,
          ease: 'power2.inOut',
        },
        0.16
      )
      .to(
        part('card'),
        {
          y: -58,
          duration: 0.84,
          ease: 'power3.out',
        },
        0.38
      )
      .fromTo(
        part('flying-petal'),
        { opacity: 0, x: 0, y: 0, rotation: 0 },
        {
          opacity: 1,
          x: -28,
          y: -76,
          rotation: -34,
          svgOrigin: '288 132',
          duration: 0.72,
          immediateRender: false,
        },
        0.65
      )
      .to(
        part('flying-petal'),
        { opacity: 0, y: -104, duration: 0.36 },
        1.35
      );
  }, svg);
  timeline.timeScale(ENVELOPE_TIME_SCALE);

  return {
    setProgress: (value) => timeline.progress(value, true).pause(),
    play: () => timeline.play(0),
    dispose: () => context.revert(),
  };
}
