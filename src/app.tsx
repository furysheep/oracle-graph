import { useEffect, useState, useCallback, useMemo } from 'react'
import { TimeSeries } from 'pondjs'
import {
  Resizable,
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  styler,
  Legend,
} from 'react-timeseries-charts'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import { format } from 'd3-format'
import _ from 'underscore'
import Select, { SingleValue } from 'react-select'
import { Bars } from 'react-loader-spinner'

import CrossHairs from './crosshairs'
import processData from './processor'

import useDebouncedEffect from './useDebouncedEffect'
import { OrgDataType } from './types'

const styles = styler([
  { key: 'floor', color: 'red', width: 1 },
  { key: 'twap1', color: '#00ffff', width: 1 },
  { key: 'twap4', color: '#ff00ff', width: 1 },
])

const options = [
  { label: 'BAYC', value: 'boredapeyachtclub' },
  { label: 'MAYC', value: 'mutant-ape-yacht-club' },
  { label: 'Moonbirds', value: 'proof-moonbirds' },
  { label: 'Doodles', value: 'doodles-official' },
  { label: 'Azuki', value: 'azuki' },
  { label: 'Clonex', value: 'clonex' },
  { label: 'Otherdeed', value: 'otherdeed' },
  { label: 'PudgyPenguins', value: 'pudgypenguins' },
  {
    label: 'Trump Digital Trading Cards',
    value: 'trump-digital-trading-cards',
  },
  { label: 'cryptodickbutts', value: 'cryptodickbutts-s3' },
  { label: 'nakamigos', value: 'nakamigos' },
  { label: 'degods', value: 'degods' },
  { label: 'Bit Bears', value: 'berachain-bit-bears' },
]

const Graph = ({ data, slug }: any) => {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(200)

  const [floors, twaps1, twaps4, initialTimeRange] = data ?? []
  const [timerange, setTimerange] = useState<any>(initialTimeRange)

  useEffect(() => {
    setTimerange(initialTimeRange)
  }, [initialTimeRange])

  const [highlight, setHighlight] = useState(null)
  const [selection, setSelection] = useState(null)
  const [tracker, setTracker] = useState(null)
  const [pos, setPos] = useState<[any, any]>([null, null])

  useDebouncedEffect(
    () => {
      if (floors) {
        setMin(floors.crop(timerange).min('floor'))
        setMax(floors.crop(timerange).max('floor'))
      }
    },
    [floors, timerange],
    300,
  )

  if (!data || !timerange) {
    return (
      <Bars
        height='80'
        width='80'
        color='#4fa94d'
        ariaLabel='bars-loading'
        wrapperStyle={{ justifyContent: 'center' }}
        visible
      />
    )
  }

  const handleTrackerChanged = (tracker: any) => {
    if (!tracker) {
      setPos([null, null])
    }
    setTracker(tracker)
  }

  const handleMouseMove = (x: any, y: any) => {
    setPos([x, y])
  }

  let floorValue, twap1Value, twap4Value

  const f = format(',.2f')

  if (tracker) {
    floorValue = `${f(floors.at(floors.bisect(tracker)).get('floor'))}`
    twap1Value = `${f(twaps1.at(twaps1.bisect(tracker)).get('twap1'))}`
    twap4Value = `${f(twaps4.at(twaps4.bisect(tracker)).get('twap4'))}`
  }

  return (
    <div>
      <Resizable>
        <ChartContainer
          timeRange={timerange}
          timeAxisStyle={{
            ticks: {
              stroke: '#333',
              opacity: 0.25,
              'stroke-dasharray': '1,1',
              // Note: this isn't in camel case because this is
              // passed into d3's style
            },
            values: {
              fill: '#000',
              'font-size': 12,
            },
          }}
          showGrid
          maxTime={floors.range().end()}
          minTime={floors.range().begin()}
          timeAxisAngledLabels
          timeAxisHeight={65}
          enablePanZoom
          onTimeRangeChanged={setTimerange}
          onTrackerChanged={handleTrackerChanged}
          onBackgroundClick={() => setSelection(null)}
          onMouseMove={(x: any, y: any) => handleMouseMove(x, y)}
          minDuration={1000 * 60 * 60 * 24 * 1}
        >
          <ChartRow height='400'>
            <YAxis
              id='price'
              label='Price'
              min={min}
              max={max}
              style={{
                ticks: {
                  stroke: '#AAA',
                  opacity: 0.25,
                  'stroke-dasharray': '1,1',
                  // Note: this isn't in camel case because this is
                  // passed into d3's style
                },
                values: {
                  fill: '#000',
                  'font-size': 12,
                },
              }}
              showGrid
              hideAxisLine
              width='80'
              format=',.1f'
            />
            <Charts>
              <LineChart
                interpolation='curveStepAfter'
                axis='price'
                highlight={highlight}
                onHighlightChange={setHighlight}
                selection={selection}
                onSelectionChange={setSelection}
                columns={['floor']}
                series={floors}
                style={styles}
              />
              <LineChart
                interpolation='curveStepAfter'
                axis='price'
                highlight={highlight}
                onHighlightChange={setHighlight}
                selection={selection}
                onSelectionChange={setSelection}
                columns={['twap1']}
                series={twaps1}
                style={styles}
              />
              <LineChart
                interpolation='curveStepAfter'
                axis='price'
                highlight={highlight}
                onHighlightChange={setHighlight}
                selection={selection}
                onSelectionChange={setSelection}
                columns={['twap4']}
                series={twaps4}
                style={styles}
              />
              <CrossHairs x={pos[0]} y={pos[1]} />
            </Charts>
          </ChartRow>
        </ChartContainer>
      </Resizable>
      <Legend
        type='line'
        align='right'
        style={styles}
        highlight={highlight}
        onHighlightChange={setHighlight}
        selection={selection}
        onSelectionChange={setSelection}
        categories={[
          { key: 'floor', label: 'Floor', value: floorValue },
          {
            key: 'twap1',
            label: 'Twap 1hrs',
            value: twap1Value,
          },
          {
            key: 'twap4',
            label: 'Twap 4hrs',
            value: twap4Value,
          },
        ]}
      />
    </div>
  )
}

export const App = () => {
  const [selectedOption, setSelectedOption] = useState<
    SingleValue<{
      value: string
      label: string
    }>
  >(options[0])
  const [slug, setSlug] = useState('boredapeyachtclub')
  const [floorsData, setFloorsData] = useState<OrgDataType[] | null>(null)
  const handleChangeCollection = (
    newValue: SingleValue<{
      value: string
      label: string
    }>,
  ) => {
    setSelectedOption(newValue)
    if (newValue?.value) setSlug(newValue?.value)
  }

  useEffect(() => {
    setFloorsData(null)
    fetch(`https://nftperp-oracle.s3.eu-central-1.amazonaws.com/${slug}.json`)
      .then((response) => response.json())
      .then((floorsData) => {
        setFloorsData(floorsData)
      })
  }, [slug])

  const data = useMemo(() => {
    if (!floorsData) return null
    const [twap1, twap4] = processData(floorsData)
    const points = floorsData.map((e: OrgDataType) => [
      moment(e.timestamp).valueOf(),
      new BigNumber(e.value).div(new BigNumber(10).pow(18)).toNumber(),
    ])

    const floorSeries = new TimeSeries({
      name: 'Sales',
      columns: ['time', 'floor'],
      points,
    })
    return [
      floorSeries,
      new TimeSeries({
        name: 'Sales',
        columns: ['time', 'twap1'],
        points: twap1.map((e) => [
          moment(e.timestamp).valueOf(),
          new BigNumber(e.price).div(new BigNumber(10).pow(18)).toNumber(),
        ]),
      }),
      new TimeSeries({
        name: 'Sales',
        columns: ['time', 'twap4'],
        points: twap4.map((e) => [
          moment(e.timestamp).valueOf(),
          new BigNumber(e.price).div(new BigNumber(10).pow(18)).toNumber(),
        ]),
      }),
      floorSeries.timerange(),
    ]
  }, [floorsData])

  return (
    <div className='p-10'>
      <div className='mb-4'>
        <Select
          options={options}
          onChange={handleChangeCollection}
          value={selectedOption}
        />
      </div>
      <Graph data={data} slug={slug} />
    </div>
  )
}
