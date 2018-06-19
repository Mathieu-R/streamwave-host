import { h } from 'preact';

const ProgressRound = ({progress, value, radius}) => {
  return (
    <div class="progress-round">
      <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <text class="progress-round__text" x={radius} y={radius}>
          {value}
        </text>
        <circle
          class="progress-round__circle--pattern"
          r={radius - 2}
          cx={radius}
          cy={radius}
        />
        <circle
          class="progress-round__circle--progress"
          r={radius - 2}
          cx={radius}
          cy={radius}
          transform={`rotate(-90, ${radius}, ${radius})`}
          stroke-dasharray={`${progress * 100},100`}
          strokeDasharray={`${progress * 100},100`}
          fill="none"
        />
      </svg>
    </div>
  );
};

ProgressRound.defaultProps = {
  radius: 16
};

export default ProgressRound;
