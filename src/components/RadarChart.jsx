import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { ERROR_CATEGORIES } from '../data/errorCategories'

export default function SkillRadarChart({ profile, compact = false }) {
  const data = ERROR_CATEGORIES.map(cat => {
    const stats = profile?.categories?.[cat.id]
    const rate = stats && stats.encountered > 0
      ? Math.round((stats.identified / stats.encountered) * 100)
      : 0
    return {
      category: cat.label.length > 15 ? cat.label.slice(0, 13) + '…' : cat.label,
      fullLabel: cat.label,
      rate,
      encountered: stats?.encountered || 0,
    }
  })

  if (!profile || profile.sessionsCompleted === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Complete a review session to see your skill profile.
      </div>
    )
  }

  return (
    <div className={compact ? 'h-40' : 'h-56'}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius={compact ? '60%' : '70%'}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: compact ? 8 : 9, fill: '#6b7280' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 8, fill: '#9ca3af' }}
            tickCount={5}
          />
          <Radar
            name="Detection Rate"
            dataKey="rate"
            stroke="#1a2744"
            fill="#1a2744"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
          <Tooltip
            formatter={(val, _name, props) => [`${val}% detection rate (${props.payload.encountered} sessions)`, props.payload.fullLabel]}
            contentStyle={{ fontSize: 12 }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
