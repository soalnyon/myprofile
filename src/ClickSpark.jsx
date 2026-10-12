export default function ClickSpark({ spark, onEnd }) {
  if (!spark) return null
  return <div key={spark.id} className="click-spark" style={{ left: spark.x, top: spark.y }}
    aria-hidden="true" onAnimationEnd={onEnd}>
    {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--ray': `${index * 45}deg` }} />)}
  </div>
}
