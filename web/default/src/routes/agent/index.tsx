import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/agent/')({
  component: AgentPage,
})

function AgentPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>我想成为代理</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.8 }}>
          代理计划即将开放，敬请期待。
        </p>
        <p style={{ marginTop: '1.5rem', color: '#888' }}>
          您将可以：创建推广小组、获得专属镜像站链接、自定义折扣、邀请组员、参与排行榜竞争。
        </p>
      </div>
    </div>
  )
}
