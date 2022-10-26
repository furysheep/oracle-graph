import { CSSProperties } from 'react'
import _ from 'underscore'

type Props = {
  x: any
  y: any
  width?: any
  height?: any
}

const CrossHairs = ({ x, y, width, height }: Props) => {
  const style: CSSProperties = { pointerEvents: 'none', stroke: '#ccc' }
  if (!_.isNull(x) && !_.isNull(y)) {
    return (
      <g>
        <line style={style} x1={0} y1={y} x2={width} y2={y} />
        <line style={style} x1={x} y1={0} x2={x} y2={height} />
      </g>
    )
  } else {
    return <g />
  }
}

export default CrossHairs
