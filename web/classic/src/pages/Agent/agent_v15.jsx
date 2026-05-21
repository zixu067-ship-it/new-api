import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Button, Toast, Typography, Space, Spin, Tag, Banner,
  Modal, InputNumber, Avatar, Input, Form, Divider, Empty, Tooltip,
} from '@douyinfe/semi-ui';
import {
  IconPhone, IconLink, IconCopy,
  IconUserGroup, IconPlus, IconSetting, IconStar,
  IconCrown, IconExit, IconHome,
  IconEdit, IconDelete,
} from '@douyinfe/semi-icons';
import { API } from '../../helpers';

const { Title, Text, Paragraph } = Typography;

/* ================================================================== */
/*  样式：动态渐变背景 + 玻璃拟态                                          */
/* ================================================================== */
const injectStyles = () => {
  if (document.getElementById('agent-v3-styles')) return;
  const style = document.createElement('style');
  style.id = 'agent-v3-styles';
  style.innerHTML = `
    @keyframes agentBgFlow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .agent-v3-root {
      min-height: 100vh;
      padding: 80px 24px 24px;
      background: linear-gradient(125deg, #C724B1 0%, #6E3FE7 35%, #3D7DF0 65%, #4FC3F7 100%);
      background-size: 300% 300%;
      animation: agentBgFlow 18s ease infinite;
      position: relative;
    }
    .agent-v3-root::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%),
                  radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08), transparent 50%);
      pointer-events: none;
    }
    .agent-glass {
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.4);
    }
    .agent-glass-dark {
      background: rgba(20,20,40,0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      color: #fff;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .agent-v3-banner {
      background: linear-gradient(90deg, rgba(255,215,0,0.95), rgba(255,165,0,0.9));
      color: #2a1a00;
      padding: 10px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex; align-items: center; gap: 10px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(255,140,0,0.3);
    }
    .agent-v3-hero {
      padding: 60px 40px;
      text-align: center;
      color: #fff;
    }
    .agent-v3-hero-title {
      font-size: 48px; font-weight: 800;
      background: linear-gradient(90deg, #fff, #ffd9f4);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
      letter-spacing: 2px;
    }
    .agent-v3-hero-sub {
      font-size: 18px; opacity: 0.92; max-width: 720px; margin: 0 auto 32px;
      line-height: 1.8;
    }
    .agent-v3-feat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      max-width: 1100px; margin: 0 auto 32px;
    }
    .agent-v3-feat-card {
      padding: 20px; text-align: left;
    }
    .agent-v3-feat-icon {
      font-size: 28px; margin-bottom: 8px;
    }
    .agent-v3-cta {
      background: linear-gradient(90deg, #ff4d8d, #ff6b35) !important;
      border: none !important;
      color: #fff !important;
      font-size: 18px !important; font-weight: 700 !important;
      padding: 14px 36px !important; height: auto !important;
      border-radius: 999px !important;
      box-shadow: 0 8px 24px rgba(255,77,141,0.5) !important;
    }
    .agent-v3-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(255,77,141,0.6) !important;
    }
    .agent-v3-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 20px;
      max-width: 1280px;
      margin: 0 auto;
    }
    .agent-v3-sidebar {
      padding: 16px; height: fit-content; position: sticky; top: 20px;
    }
    .agent-v3-sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-radius: 10px;
      cursor: pointer; transition: all 0.2s;
      color: #444; font-weight: 500; margin-bottom: 4px;
    }
    .agent-v3-sidebar-item:hover {
      background: rgba(199,36,177,0.08);
    }
    .agent-v3-sidebar-item.active {
      background: linear-gradient(90deg, #C724B1, #6E3FE7);
      color: #fff;
      box-shadow: 0 4px 12px rgba(110,63,231,0.3);
    }
    .agent-v3-content { padding: 24px; min-height: 600px; }
    .agent-v3-stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px; margin-bottom: 20px;
    }
    .agent-v3-stat {
      padding: 16px; border-radius: 12px;
      background: linear-gradient(135deg, #f6e8ff 0%, #e0f2ff 100%);
      border: 1px solid rgba(199,36,177,0.15);
    }
    .agent-v3-stat-label { font-size: 13px; color: #888; }
    .agent-v3-stat-value {
      font-size: 26px; font-weight: 700;
      background: linear-gradient(90deg, #C724B1, #4FC3F7);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 4px;
    }
    .agent-v3-rank {
      display: inline-block;
      width: 28px; height: 28px; line-height: 28px; text-align: center;
      border-radius: 50%; color: #fff; font-weight: 700;
      background: #aaa; font-size: 14px;
    }
    .agent-v3-rank.r1 { background: linear-gradient(135deg, #ffd700, #ff8a00); }
    .agent-v3-rank.r2 { background: linear-gradient(135deg, #c0c0c0, #888); }
    .agent-v3-rank.r3 { background: linear-gradient(135deg, #cd7f32, #8b4513); }
    .agent-v3-rank.r4, .agent-v3-rank.r5 { background: linear-gradient(135deg, #C724B1, #6E3FE7); }
    .agent-required { color: #ff3b6b; font-weight: 700; margin-left: 2px; }
    .agent-required { color: #ff3b6b; font-weight: 700; margin-left: 2px; }
  `;
  document.head.appendChild(style);
};

/* ================================================================== */
/*  小工具                                                               */
/* ================================================================== */
// 后端有时返回 0.25 (小数), 有时返回 25 (百分整数)。统一识别：>1 视为已是百分数。
// 可缩放收款码图片：直接显示缩略图，点击放大
const QrImage = ({ src, label = '收款码', size = 96 }) => {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <div
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{
          width: size, height: size, cursor: 'zoom-in',
          borderRadius: 8, overflow: 'hidden', display: 'inline-block',
          border: '1px solid #eee', background: '#fafafa',
          backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }}
        title="点击放大"
      />
      <Modal
        title={label}
        visible={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={520}
        centered
      >
        <div style={{ textAlign: 'center' }}>
          <img src={src} alt={label} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
          <div style={{ marginTop: 8 }}>
            <a href={src} target="_blank" rel="noreferrer">在新窗口打开原图</a>
          </div>
        </div>
      </Modal>
    </>
  );
};

// 头像 localStorage 兜底（后端 agent_profile 表暂无 avatar 列）
const avatarKey = (uid) => `agent_avatar_${uid || 'me'}`;
const readAvatar = (uid) => {
  try { return localStorage.getItem(avatarKey(uid)) || ''; } catch { return ''; }
};
const writeAvatar = (uid, url) => {
  try { localStorage.setItem(avatarKey(uid), url || ''); } catch {}
};

const pct = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return '--';
  const p = Math.abs(n) > 1 ? n : n * 100;
  return `${p.toFixed(0)}%`;
};
// 转成 0-1 小数（用于参与计算 / 比较）
const toFrac = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return 0;
  return Math.abs(n) > 1 ? n / 100 : n;
};

const discountStr = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return '--';
  const tenths = (n * 10).toFixed(1);
  return `${tenths} 折`;
};

const copyText = (t) =>
  navigator.clipboard.writeText(t).then(() => Toast.success('已复制'));

/* ================================================================== */
/*  调试面板：右上角小按钮，点开看所有 API 的原始返回                          */
/* ================================================================== */
const DebugPanel = ({ data }) => {
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(data, null, 2);
  return (
    <>
      <Button
        size="small"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: 70, right: 12, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)', color: '#fff', borderColor: 'transparent',
        }}
      >
        🔍 调试
      </Button>
      <Modal
        title="🔍 后端原始数据（截图给开发者）"
        visible={open}
        onCancel={() => setOpen(false)}
        onOk={() => copyText(json)}
        okText="复制全部"
        cancelText="关闭"
        width={800}
      >
        <pre style={{
          background: '#1e1e2e', color: '#d0d0e0', padding: 12, borderRadius: 8,
          maxHeight: 480, overflow: 'auto', fontSize: 12, lineHeight: 1.6,
        }}>{json}</pre>
      </Modal>
    </>
  );
};

/* ================================================================== */
/*  介绍页：访客 / 未注册代理                                              */
/* ================================================================== */
const IntroPage = ({ onApply, leaderboard }) => {
  const top = leaderboard?.[0];
  return (
    <div>
      {top && (
        <div className="agent-v3-banner">
          <IconCrown style={{ fontSize: 18 }} />
          <span>本周冠军：<b>{top.group_name}</b> · 周收益 ¥{Number(top.weekly_revenue || 0).toFixed(2)} · 已解锁 +10% 分红加成 🎉</span>
        </div>
      )}

      <div className="agent-v3-hero">
        <div className="agent-v3-hero-title">💎 加入代理计划</div>
        <div className="agent-v3-hero-sub">
          组建你自己的小组、拉好友一起赚 · 最高 70% 利润分红 · 每周结算
        </div>
        <Button className="agent-v3-cta" onClick={onApply}>
          🚀 我要成为代理
        </Button>
      </div>

      <div className="agent-v3-feat-grid">
        <Card className="agent-glass agent-v3-feat-card">
          <div className="agent-v3-feat-icon">📊</div>
          <Title heading={5}>什么是代理？</Title>
          <Text type="tertiary">
            代理是平台合作伙伴。你可以建小组，邀请朋友加入，从用户充值中拿利润分红。
          </Text>
        </Card>
        <Card className="agent-glass agent-v3-feat-card">
          <div className="agent-v3-feat-icon">💰</div>
          <Title heading={5}>分红是怎么算的？</Title>
          <Text type="tertiary">
            每个新组默认分得利润的 25%。比如卖出 100 元、利润 50 元，小组拿 12.5 元。
          </Text>
        </Card>
        <Card className="agent-glass agent-v3-feat-card">
          <div className="agent-v3-feat-icon">🏆</div>
          <Title heading={5}>排行榜加成</Title>
          <Text type="tertiary">
            每周结算一次。冲进前 5 的小组，下周分红额外 +10%，最高可叠到 70%。
          </Text>
        </Card>
        <Card className="agent-glass agent-v3-feat-card">
          <div className="agent-v3-feat-icon">🌐</div>
          <Title heading={5}>专属镜像站</Title>
          <Text type="tertiary">
            每个小组配一个镜像链接，组长自定义充值折扣，吸引用户进站充值。
          </Text>
        </Card>
        <Card className="agent-glass agent-v3-feat-card">
          <div className="agent-v3-feat-icon">👥</div>
          <Title heading={5}>组员管理</Title>
          <Text type="tertiary">
            组长生成专属邀请链接，给每位组员单独设定分红比例。可重复生成不限次。
          </Text>
        </Card>
        <Card className="agent-glass agent-v3-feat-card">
          <div className="agent-v3-feat-icon">📱</div>
          <Title heading={5}>每周打款</Title>
          <Text type="tertiary">
            主管每周向组长打款，组长再分给组员。后台留好微信、电话、收款码即可。
          </Text>
        </Card>
      </div>

    </div>
  );
};

/* ================================================================== */
/*  资料填写                                                             */
/* ================================================================== */
const ProfileForm = ({ initial, onSave, onCancel, mode = 'create' }) => {
  const [form, setForm] = useState({
    name: initial?.real_name || initial?.name || initial?.nickname || '',
    nickname: initial?.nickname || initial?.real_name || initial?.name || '',
    // 头像：优先后端，回退到本地缓存
    avatar: initial?.avatar_url || initial?.avatar || readAvatar(initial?.user_id) || '',
    wechat: initial?.wechat_id || initial?.wechat || '',
    phone: initial?.phone || '',
    payment_qr: initial?.wechat_qr_url || initial?.payment_qr || '',
    slogan: initial?.slogan || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.wechat || !form.phone) {
      Toast.warning('姓名、微信、电话为必填');
      return;
    }
    setSaving(true);
    try {
      // 头像写本地（兜底）+ 同时提交两个字段名，兼容后端任意一个
      writeAvatar(initial?.user_id, form.avatar);
      await onSave({
        real_name: form.name,
        nickname: form.nickname || form.name,
        avatar: form.avatar,
        avatar_url: form.avatar,
        wechat_id: form.wechat,
        phone: form.phone,
        wechat_qr_url: form.payment_qr,
        slogan: form.slogan,
      });
    }
    finally { setSaving(false); }
  };

  return (
    <Card className="agent-glass agent-v3-content" style={{ maxWidth: 720, margin: '0 auto' }}>
      <Title heading={3} style={{ marginBottom: 8 }}>
        {mode === 'create' ? '📝 填写代理资料' : '✏️ 修改代理资料'}
      </Title>
      <Text type="tertiary">填完即可建立你自己的小组（联系方式仅小组内可见 + 主管后台）</Text>
      <Divider />
      <Space vertical spacing="loose" style={{ width: '100%' }}>
        <div>
          <Text strong>姓名<span className="agent-required">*</span></Text>
          <Input value={form.name} onChange={(v) => setForm({ ...form, name: v, nickname: form.nickname || v })} placeholder="你的真实姓名" />
        </div>
        <div>
          <Text strong>昵称（可选）</Text>
          <Input value={form.nickname} onChange={(v) => setForm({ ...form, nickname: v })} placeholder="显示给组员的名字（留空则用姓名）" />
        </div>
        <div>
          <Text strong>头像 URL</Text>
          <Input value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} placeholder="https://..." />
        </div>
        <div>
          <Text strong>微信号<span className="agent-required">*</span></Text>
          <Input value={form.wechat} onChange={(v) => setForm({ ...form, wechat: v })} />
        </div>
        <div>
          <Text strong>电话<span className="agent-required">*</span></Text>
          <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        </div>
        <div>
          <Text strong>收款码 URL</Text>
          <Input value={form.payment_qr} onChange={(v) => setForm({ ...form, payment_qr: v })} placeholder="https://... 上传后图片直链" />
        </div>
        <div>
          <Text strong>个人宣传语</Text>
          <Input value={form.slogan} onChange={(v) => setForm({ ...form, slogan: v })} placeholder="一句话介绍自己" />
        </div>
      </Space>
      <Divider />
      <Space>
        <Button theme="solid" type="primary" loading={saving} onClick={submit}>
          {mode === 'create' ? '保存并下一步' : '保存修改'}
        </Button>
        {onCancel && <Button onClick={onCancel}>取消</Button>}
      </Space>
    </Card>
  );
};

/* ================================================================== */
/*  小组创建                                                             */
/* ================================================================== */
const GroupCreateForm = ({ onSave }) => {
  const [form, setForm] = useState({
    group_name: '', slogan: '', message_to_members: '', avatar_url: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.group_name.trim()) { Toast.warning('请填写小组名称'); return; }
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <Card className="agent-glass agent-v3-content" style={{ maxWidth: 720, margin: '0 auto' }}>
      <Title heading={3} style={{ marginBottom: 4 }}>🏗️ 创建你的小组</Title>
      <Text type="tertiary">
        小组初始分红比例 25%，进入排行榜前 5 后可解锁 +10% / 周，最高 70%
      </Text>
      <Divider style={{ margin: '16px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Avatar src={form.avatar_url} size="large" style={{ background: 'linear-gradient(135deg,#C724B1,#6E3FE7)', flexShrink: 0 }}>
          {form.group_name?.[0] || '组'}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text strong>小组头像 URL</Text>
          <Input
            value={form.avatar_url}
            onChange={(v) => setForm({ ...form, avatar_url: v })}
            placeholder="https://... 留空则用首字头像"
          />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Text strong>小组名称<span className="agent-required">*</span></Text>
        <Input
          value={form.group_name}
          onChange={(v) => setForm({ ...form, group_name: v })}
          placeholder="给小组起个响亮的名字"
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <Text strong>小组宣传语</Text>
        <Input
          value={form.slogan}
          onChange={(v) => setForm({ ...form, slogan: v })}
          placeholder="一句话介绍这个小组"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>对组员说的话</Text>
        <Input
          value={form.message_to_members}
          onChange={(v) => setForm({ ...form, message_to_members: v })}
          placeholder="加入小组后组员能看到的欢迎语"
        />
      </div>

      <Divider style={{ margin: '8px 0 16px' }} />
      <Button theme="solid" type="primary" size="large" block loading={saving} onClick={submit}>
        🚀 创建小组
      </Button>
    </Card>
  );
};

/* ================================================================== */
/*  组长仪表盘                                                            */
/* ================================================================== */
const LeaderDashboard = ({ profile, group, members, leaderboard, reload }) => {
  const [tab, setTab] = useState('overview');
  const [editGroup, setEditGroup] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitePct, setInvitePct] = useState(20);
  const [inviteToken, setInviteToken] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [editPct, setEditPct] = useState(0);
  // 折扣字段：后端实际叫 default_discount（0.95 = 9.5折）；UI 用整数 90-100 表示
  const initDiscount = Math.round((Number(group?.default_discount) > 0 ? Number(group.default_discount) : 0.95) * 100);
  const [mirrorDiscount, setMirrorDiscount] = useState(initDiscount);
  useEffect(() => {
    if (group?.default_discount) {
      setMirrorDiscount(Math.round(Number(group.default_discount) * 100));
    }
  }, [group?.default_discount]);
  const [zoomImg, setZoomImg] = useState(null);

  const myRank = useMemo(() => {
    const idx = leaderboard.findIndex((g) => g.group_id === (group?.id || 0));
    return idx >= 0 ? idx + 1 : null;
  }, [leaderboard, group]);

  const baseShare = toFrac(group?.base_share_pct ?? 0.25);
  const bonusShare = toFrac(group?.bonus_share_pct ?? 0);
  const currentShare = toFrac(group?.current_share_pct ?? (baseShare + bonusShare));
  const totalShare = Math.min(currentShare || (baseShare + bonusShare), 0.7);

  const usedPct = (members || []).reduce((s, m) => s + toFrac(m.share_pct_in_group || 0), 0);
  const remainPct = Math.max(0, 1 - usedPct);

  const handleSaveGroup = async (vals) => {
    const r = await API.put('/api/agent/group', vals);
    if (r.data.success) {
      Toast.success('已保存');
      setEditGroup(false);
      reload();
    } else Toast.error(r.data.message || '保存失败');
  };

  const handleSaveProfile = async (vals) => {
    const r = await API.post('/api/agent/profile', vals);
    if (r.data.success) {
      Toast.success('已保存');
      setEditProfile(false);
      reload();
    } else Toast.error(r.data.message || '保存失败');
  };

  const generateInvite = async () => {
    if (invitePct <= 0 || invitePct > 100) {
      Toast.warning('邀请比例需在 1-100 之间');
      return;
    }
    const r = await API.post('/api/agent/group/invite', {
      share_pct_in_group: invitePct / 100,
    });
    if (r.data.success) {
      setInviteToken(r.data.data.token);
      Toast.success('已生成邀请链接');
    } else Toast.error(r.data.message || '生成失败');
  };

  const inviteUrl = inviteToken ? `${window.location.origin}/agent?invite=${inviteToken}` : '';

  const updateMember = async () => {
    if (!editMember) return;
    const r = await API.put(`/api/agent/group/member/${editMember.user_id}`, {
      share_pct_in_group: editPct / 100,
    });
    if (r.data.success) {
      Toast.success('已更新');
      setEditMember(null);
      reload();
    } else Toast.error(r.data.message || '更新失败');
  };

  const kickMember = async (m) => {
    Modal.confirm({
      title: '移除组员？',
      content: `确认将 ${m.username} 移出小组？`,
      onOk: async () => {
        const r = await API.delete(`/api/agent/group/member/${m.user_id}`);
        if (r.data.success) { Toast.success('已移除'); reload(); }
        else Toast.error(r.data.message || '失败');
      },
    });
  };

  const sidebar = [
    { key: 'overview', icon: <IconHome />, label: '小组概览' },
    { key: 'members',  icon: <IconUserGroup />, label: '组员管理' },
    { key: 'invite',   icon: <IconLink />, label: '邀请链接' },
    { key: 'mirror',   icon: <IconLink />, label: '镜像站' },
    { key: 'rank',     icon: <IconStar />, label: '排行榜' },
    { key: 'settings', icon: <IconSetting />, label: '小组设置' },
  ];

  return (
    <div className="agent-v3-layout">
      {/* 侧边导航 */}
      <Card className="agent-glass agent-v3-sidebar">
        <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
          <Avatar src={profile?.avatar_url} size="large" style={{ background: 'linear-gradient(135deg, #C724B1, #4FC3F7)' }}>
            {(profile?.real_name || profile?.nickname)?.[0] || 'A'}
          </Avatar>
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            <IconCrown style={{ color: '#ffaa00', marginRight: 4 }} />
            {(profile?.real_name || profile?.nickname) || '组长'}
          </div>
          <Tag size="small" style={{ marginTop: 4 }}>{group?.group_name}</Tag>
        </div>
        <Divider margin="8px" />
        {sidebar.map((s) => (
          <div
            key={s.key}
            className={`agent-v3-sidebar-item ${tab === s.key ? 'active' : ''}`}
            onClick={() => setTab(s.key)}
          >
            {s.icon}
            <span>{s.label}</span>
          </div>
        ))}
      </Card>

      {/* 主内容 */}
      <Card className="agent-glass agent-v3-content">
        {tab === 'overview' && (
          <div>
            <Title heading={3}>📊 小组概览</Title>
            <div className="agent-v3-stat-grid" style={{ marginTop: 16 }}>
              <div className="agent-v3-stat">
                <div className="agent-v3-stat-label">本周排名</div>
                <div className="agent-v3-stat-value">{myRank ? `#${myRank}` : '未上榜'}</div>
              </div>
              <div className="agent-v3-stat">
                <div className="agent-v3-stat-label">基础分红</div>
                <div className="agent-v3-stat-value">{pct(baseShare)}</div>
              </div>
              <div className="agent-v3-stat">
                <div className="agent-v3-stat-label">额外加成</div>
                <div className="agent-v3-stat-value">+{pct(bonusShare)}</div>
              </div>
              <div className="agent-v3-stat">
                <div className="agent-v3-stat-label">当前总分红</div>
                <div className="agent-v3-stat-value">{pct(totalShare)}</div>
              </div>
              <div className="agent-v3-stat">
                <div className="agent-v3-stat-label">本周收益</div>
                <div className="agent-v3-stat-value">¥{Number(group?.weekly_revenue || 0).toFixed(2)}</div>
              </div>
              <div className="agent-v3-stat">
                <div className="agent-v3-stat-label">累计收益</div>
                <div className="agent-v3-stat-value">¥{Number(group?.total_revenue || 0).toFixed(2)}</div>
              </div>
            </div>

            <Divider />

            <Title heading={5}>🧮 分红计算公式</Title>
            <Card style={{ background: '#faf6ff', marginTop: 8 }}>
              <Paragraph>
                小组分红额 = 平台利润 × <b>{pct(totalShare)}</b><br/>
                <Text type="tertiary">（基础 25% + 排行榜加成{bonusShare > 0 ? ` +${pct(bonusShare)}` : ' 0%'}，上限 70%）</Text>
              </Paragraph>
              <Paragraph>
                单个组员分红 = 小组分红额 × 你给他设的百分比<br/>
                <Text type="tertiary">所有组员加起来不能超过 100%（即整个小组分红额）</Text>
              </Paragraph>
              <Paragraph type="warning">
                组员看到的"分红比例"是你设的那个数字（如 50%），他不知道这是小组分红里的 50%，仅作激励用途。
              </Paragraph>
            </Card>

            {/* 组长专属：分红设置快捷面板 */}
            <Divider />
            <Title heading={5}>👑 组长专属：分红设置</Title>
            <Card style={{ background: 'linear-gradient(135deg, #fff5fa, #f0f7ff)', marginTop: 8 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
                <div>
                  <div style={{ fontSize: 13, color: '#888' }}>本组当前分红比例</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#C724B1' }}>{pct(totalShare)}</div>
                  <Text type="tertiary">基础 {pct(baseShare)} + 排行榜加成 {pct(bonusShare)}</Text>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#888' }}>已分配给组员</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#3D7DF0' }}>{(usedPct * 100).toFixed(0)}%</div>
                  <Text type="tertiary">剩余可分配 {(remainPct * 100).toFixed(0)}%</Text>
                </div>
                <div>
                  <Button theme="solid" type="primary" icon={<IconSetting />} onClick={() => setTab('settings')}>
                    去设置
                  </Button>
                  <div style={{ marginTop: 8 }}>
                    <Button onClick={() => setTab('invite')} icon={<IconLink />}>生成邀请链接</Button>
                  </div>
                </div>
              </Space>
            </Card>
          </div>
        )}

        {tab === 'members' && (
          <div>
            <Space>
              <Title heading={3}>👥 组员管理</Title>
              <Tag color="violet">已分配 {(usedPct * 100).toFixed(0)}% / 剩余 {(remainPct * 100).toFixed(0)}%</Tag>
            </Space>
            <div style={{ marginTop: 16 }}>
              {(!members || members.length === 0) && (
                <Empty title="还没有组员" description="去「邀请链接」生成链接拉人吧" />
              )}
              {(members || []).map((m) => (
                <Card key={m.user_id} style={{ marginBottom: 12 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
                    <Space align="start">
                      <Avatar src={m.avatar}>{(m.nickname || m.username || '?')[0]}</Avatar>
                      <div>
                        <div><b>{m.nickname || m.username}</b> <Tag size="small">分红 {pct(m.share_pct_in_group)}</Tag></div>
                        <div style={{ marginTop: 4, fontSize: 13, color: '#666' }}>
                          <IconPhone size="small" /> {m.phone || '-'}
                          微信 {m.wechat || '-'}
                        </div>
                        {(m.wechat_qr_url || m.payment_qr) && (
                          <div style={{ marginTop: 8 }}>
                            <QrImage src={m.wechat_qr_url || m.payment_qr} label={`${m.nickname || m.username || ''} 的收款码`} size={80} />
                          </div>
                        )}
                      </div>
                    </Space>
                    <Space>
                      <Button size="small" icon={<IconEdit />} onClick={() => {
                        setEditMember(m);
                        setEditPct(Math.round(toFrac(m.share_pct_in_group) * 100));
                      }}>改比例</Button>
                      <Button size="small" type="danger" icon={<IconDelete />} onClick={() => kickMember(m)}>移除</Button>
                    </Space>
                  </Space>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'invite' && (
          <div>
            <Title heading={3}>🔗 邀请新组员</Title>
            <Text type="tertiary">每条邀请链接可单独设定分红比例。链接可重复生成、不限次数。</Text>
            <Divider />
            <Space vertical spacing="loose" style={{ width: '100%', maxWidth: 560 }}>
              <div>
                <Text strong>给该组员的分红比例</Text>
                <Space>
                  <InputNumber
                    min={1} max={100} step={1}
                    value={invitePct}
                    onChange={(v) => setInvitePct(v || 0)}
                    style={{ width: 140 }}
                  />
                  <Text>%</Text>
                </Space>
                <div style={{ marginTop: 6, color: '#888', fontSize: 13 }}>
                  剩余可分配额度：{(remainPct * 100).toFixed(0)}%
                  <Text type="warning">（组员看到的就是这个数字）</Text>
                </div>
              </div>
              <Button theme="solid" type="primary" icon={<IconPlus />} onClick={generateInvite}>
                生成邀请链接
              </Button>
              {inviteUrl && (
                <Card style={{ background: '#f0f9ff' }}>
                  <Text strong>邀请链接：</Text>
                  <Input
                    value={inviteUrl}
                    readonly
                    suffix={<Button icon={<IconCopy />} onClick={() => copyText(inviteUrl)}>复制</Button>}
                  />
                </Card>
              )}
            </Space>
          </div>
        )}

        {tab === 'mirror' && (
          <div>
            <Title heading={3}>🌐 镜像站设置</Title>
            <Text type="tertiary">每个小组配一个专属镜像站，组长自定义充值折扣吸引用户</Text>
            <Divider />
            <Space vertical spacing="loose" style={{ width: '100%', maxWidth: 560 }}>
              <div>
                <Text strong>镜像站路径</Text>
                <Input
                  value={`${window.location.origin}/m/${group?.group_code || group?.mirror_slug || group?.id}`}
                  readonly
                  suffix={<Button icon={<IconCopy />} onClick={() => copyText(`${window.location.origin}/m/${group?.group_code || group?.mirror_slug || group?.id}`)}>复制</Button>}
                />
              </div>
              <div>
                <Text strong>充值折扣（90-100，95 即 9.5 折）</Text>
                <Space>
                  <InputNumber
                    min={90} max={100} step={1}
                    value={mirrorDiscount}
                    onChange={(v) => setMirrorDiscount(v || 100)}
                    style={{ width: 140 }}
                  />
                  <Text strong style={{ color: '#C724B1' }}>= {discountStr(mirrorDiscount / 100)}</Text>
                </Space>
                <div style={{ marginTop: 6, color: '#888', fontSize: 13 }}>
                  100 = 不打折，90 = 9 折（最低）
                </div>
              </div>
              <Button
                theme="solid" type="primary"
                onClick={async () => {
                  // 只发折扣字段，避免空字段覆盖小组名/头像/宣传语
                  const r = await API.put('/api/agent/group', {
                    default_discount: mirrorDiscount / 100,
                    recommend_discount: mirrorDiscount / 100,
                  });
                  if (r.data.success) { Toast.success('已保存折扣 ' + (mirrorDiscount/10).toFixed(1) + ' 折'); reload(); }
                  else Toast.error(r.data.message || '保存失败');
                }}
              >
                保存折扣
              </Button>
            </Space>
          </div>
        )}

        {tab === 'rank' && (
          <div>
            <Title heading={3}>🏆 排行榜（全部小组）</Title>
            <Text type="tertiary">每周一 0:00 结算 · 前 5 名解锁 +10% 分红，下周生效</Text>
            <Divider />
            {(!leaderboard || leaderboard.length === 0) ? (
              <Empty title="暂无数据" />
            ) : (
              leaderboard.map((g, i) => {
                const rk = i + 1;
                const cls = rk <= 3 ? `r${rk}` : rk <= 5 ? 'r5' : '';
                const mine = g.group_id === (group?.id || 0);
                return (
                  <Card key={g.group_id} style={{ marginBottom: 8, background: mine ? '#fff5fa' : undefined, border: mine ? '2px solid #C724B1' : undefined }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <span className={`agent-v3-rank ${cls}`}>{rk}</span>
                        <b>{g.group_name}</b>
                        {mine && <Tag color="violet">我的小组</Tag>}
                        {rk <= 5 && <Tag color="orange">+10% 加成中</Tag>}
                      </Space>
                      <Space>
                        <Text>周收益 ¥{Number(g.weekly_revenue || 0).toFixed(2)}</Text>
                      </Space>
                    </Space>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <Title heading={3}>⚙️ 小组与个人设置</Title>
            <Divider />
            <Title heading={5}>小组信息</Title>
            <Card style={{ marginBottom: 16 }}>
              <p><b>名称：</b>{group?.group_name}</p>
              <p><b>宣传语：</b>{group?.slogan || '-'}</p>
              <p><b>对组员的话：</b>{group?.message_to_members || '-'}</p>
              <Button icon={<IconEdit />} onClick={() => setEditGroup(true)}>修改小组信息</Button>
            </Card>

            <Title heading={5}>个人资料</Title>
            <Card>
              <Space align="start">
                <Avatar src={profile?.avatar_url || profile?.avatar} size="large">
                  {(profile?.real_name || profile?.nickname)?.[0] || 'A'}
                </Avatar>
                <div>
                  <p style={{ margin: 0 }}><b>昵称：</b>{(profile?.real_name || profile?.nickname)}</p>
                  <p style={{ margin: '4px 0' }}><b>微信：</b>{profile?.wechat_id || profile?.wechat}　<b>电话：</b>{profile?.phone}</p>
                  <p style={{ margin: '4px 0' }}><b>宣传语：</b>{profile?.slogan || '-'}</p>
                </div>
              </Space>
              {(profile?.wechat_qr_url || profile?.payment_qr) && (
                <div style={{ marginTop: 12 }}>
                  <Text type="tertiary" style={{ display: 'block', marginBottom: 6 }}>我的收款码（点击放大）</Text>
                  <QrImage src={profile.wechat_qr_url || profile.payment_qr} label="我的收款码" size={100} />
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Button icon={<IconEdit />} onClick={() => setEditProfile(true)}>修改个人资料</Button>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* 修改组员比例弹窗 */}
      <Modal
        title="修改组员分红比例"
        visible={!!editMember}
        onCancel={() => setEditMember(null)}
        onOk={updateMember}
      >
        <Space>
          <InputNumber min={0} max={100} step={1} value={editPct} onChange={(v) => setEditPct(v || 0)} />
          <Text>%</Text>
        </Space>
        <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>
          当前剩余可分配：{((remainPct + toFrac(editMember?.share_pct_in_group || 0)) * 100).toFixed(0)}%
        </div>
      </Modal>

      {/* 修改小组弹窗 */}
      <Modal
        title="修改小组信息"
        visible={editGroup}
        onCancel={() => setEditGroup(false)}
        footer={null}
        width={640}
      >
        <GroupEditInline initial={group} onSave={handleSaveGroup} />
      </Modal>

      {/* 修改个人资料弹窗 */}
      <Modal
        title="修改个人资料"
        visible={editProfile}
        onCancel={() => setEditProfile(false)}
        footer={null}
        width={640}
      >
        <ProfileForm initial={profile} mode="edit" onSave={handleSaveProfile} onCancel={() => setEditProfile(false)} />
      </Modal>
    </div>
  );
};

/* 小组信息内联编辑（弹窗里用） */
const GroupEditInline = ({ initial, onSave }) => {
  const [f, setF] = useState({
    group_name: initial?.group_name || initial?.name || '',
    slogan: initial?.slogan || '',
    message_to_members: initial?.message_to_members || '',
    avatar_url: initial?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  return (
    <Space vertical spacing="loose" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar src={f.avatar_url} size="large" style={{ background: 'linear-gradient(135deg,#C724B1,#6E3FE7)', flexShrink: 0 }}>
          {f.group_name?.[0] || '组'}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text strong>小组头像 URL</Text>
          <Input value={f.avatar_url} onChange={(v) => setF({ ...f, avatar_url: v })} placeholder="https://... 留空则用首字头像" />
        </div>
      </div>
      <div>
        <Text strong>小组名称</Text>
        <Input value={f.group_name} onChange={(v) => setF({ ...f, group_name: v })} />
      </div>
      <div>
        <Text strong>宣传语</Text>
        <Input value={f.slogan} onChange={(v) => setF({ ...f, slogan: v })} />
      </div>
      <div>
        <Text strong>对组员说的话</Text>
        <Input value={f.message_to_members} onChange={(v) => setF({ ...f, message_to_members: v })} />
      </div>
      <Button theme="solid" type="primary" loading={saving} onClick={async () => { setSaving(true); try { await onSave(f); } finally { setSaving(false); } }}>
        保存
      </Button>
    </Space>
  );
};

/* ================================================================== */
/*  组员仪表盘                                                            */
/* ================================================================== */
const MemberDashboard = ({ profile, group, leader, leaderboard, reload }) => {
  const [editProfile, setEditProfile] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);

  const myRank = useMemo(() => {
    const idx = leaderboard.findIndex((g) => g.group_id === (group?.id || 0));
    return idx >= 0 ? idx + 1 : null;
  }, [leaderboard, group]);

  const handleSaveProfile = async (vals) => {
    const r = await API.post('/api/agent/profile', vals);
    if (r.data.success) {
      Toast.success('已保存');
      setEditProfile(false);
      reload();
    } else Toast.error(r.data.message || '保存失败');
  };

  const leave = () => {
    Modal.confirm({
      title: '退出小组？',
      content: '退出后不再获得分红，可被组长重新邀请。',
      onOk: async () => {
        const r = await API.delete('/api/agent/group/leave');
        if (r.data.success) { Toast.success('已退出'); reload(); }
        else Toast.error(r.data.message || '失败');
      },
    });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* 所在小组信息卡 */}
      <Card className="agent-glass" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(199,36,177,0.08), rgba(79,195,247,0.08))' }}>
        <Space align="start">
          <Avatar src={group?.avatar_url} size="large" style={{ background: 'linear-gradient(135deg, #C724B1, #4FC3F7)' }}>
            {group?.group_name?.[0] || 'G'}
          </Avatar>
          <div>
            <Title heading={4} style={{ margin: 0 }}>{group?.group_name || '我的小组'}</Title>
            {group?.slogan && <Text type="tertiary">"{group.slogan}"</Text>}
            <div style={{ marginTop: 6 }}>
              <Tag color="violet">当前小组分红 {pct(group?.current_share_pct ?? group?.base_share_pct)}</Tag>
              {group?.group_code && <Tag>邀请码 {group.group_code}</Tag>}
            </div>
          </div>
        </Space>
      </Card>

      <Card className="agent-glass agent-v3-content" style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <Space align="start">
            <Avatar src={profile?.avatar_url} size="large">{(profile?.real_name || profile?.nickname)?.[0]}</Avatar>
            <div>
              <Title heading={4}>{(profile?.real_name || profile?.nickname)}</Title>
              <Tag color="blue">小组组员</Tag>
              <Tag color="violet">所在小组：{group?.group_name}</Tag>
            </div>
          </Space>
          <Space>
            <Button onClick={() => setIntroOpen(true)}>📖 了解代理</Button>
            <Button icon={<IconEdit />} onClick={() => setEditProfile(true)}>修改资料</Button>
            <Button type="danger" icon={<IconExit />} onClick={leave}>退出小组</Button>
          </Space>
        </Space>
      </Card>

      <div className="agent-v3-stat-grid">
        <div className="agent-v3-stat">
          <div className="agent-v3-stat-label">我的分红比例</div>
          <div className="agent-v3-stat-value">{pct(profile?.share_pct_in_group || 0)}</div>
        </div>
        <div className="agent-v3-stat">
          <div className="agent-v3-stat-label">小组本周排名</div>
          <div className="agent-v3-stat-value">{myRank ? `#${myRank}` : '未上榜'}</div>
        </div>
        <div className="agent-v3-stat">
          <div className="agent-v3-stat-label">我的本周收益</div>
          <div className="agent-v3-stat-value">¥{Number(profile?.weekly_revenue || 0).toFixed(2)}</div>
        </div>
        <div className="agent-v3-stat">
          <div className="agent-v3-stat-label">我的累计收益</div>
          <div className="agent-v3-stat-value">¥{Number(profile?.total_revenue || 0).toFixed(2)}</div>
        </div>
      </div>

      <Card className="agent-glass" style={{ marginTop: 16 }}>
        <Title heading={4}>👑 我的组长</Title>
        <Divider />
        <Space align="start">
          <Avatar src={leader?.avatar_url} size="large">{(leader?.real_name || leader?.nickname)?.[0]}</Avatar>
          <div>
            <div><b>{(leader?.real_name || leader?.nickname)}</b></div>
            <div style={{ color: '#666', marginTop: 4 }}>
              微信：{leader?.wechat_id || leader?.wechat || '-'}　电话：{leader?.phone || '-'}
            </div>
            {leader?.slogan && <Paragraph style={{ marginTop: 8 }}>"{leader.slogan}"</Paragraph>}
            {(leader?.wechat_qr_url || leader?.payment_qr) && (
              <div style={{ marginTop: 10 }}>
                <Text type="tertiary" style={{ display: 'block', marginBottom: 6 }}>组长收款码（点击放大）</Text>
                <QrImage src={leader.wechat_qr_url || leader.payment_qr} label="组长收款码" size={120} />
              </div>
            )}
          </div>
        </Space>
        {group?.message_to_members && (
          <Card style={{ marginTop: 12, background: '#fff7e6' }}>
            <Text strong>📣 组长留言：</Text>
            <Paragraph>{group.message_to_members}</Paragraph>
          </Card>
        )}
      </Card>

      <Card className="agent-glass" style={{ marginTop: 16 }}>
        <Title heading={4}>🏆 小组排行榜</Title>
        <Divider />
        {(!leaderboard || leaderboard.length === 0) ? (
          <Empty title="暂无数据" />
        ) : leaderboard.map((g, i) => {
          const rk = i + 1;
          const cls = rk <= 3 ? `r${rk}` : rk <= 5 ? 'r5' : '';
          const mine = g.group_id === (group?.id || 0);
          return (
            <Card key={g.group_id} style={{ marginBottom: 8, background: mine ? '#fff5fa' : undefined }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <span className={`agent-v3-rank ${cls}`}>{rk}</span>
                  <b>{g.group_name}</b>
                  {mine && <Tag color="violet">我的小组</Tag>}
                  {rk <= 5 && <Tag color="orange">+10% 加成中</Tag>}
                </Space>
                <Text>周收益 ¥{Number(g.weekly_revenue || 0).toFixed(2)}</Text>
              </Space>
            </Card>
          );
        })}
      </Card>

      <Modal
        title="修改个人资料"
        visible={editProfile}
        onCancel={() => setEditProfile(false)}
        footer={null}
        width={640}
      >
        <ProfileForm initial={profile} mode="edit" onSave={handleSaveProfile} onCancel={() => setEditProfile(false)} />
      </Modal>

      <Modal
        title="代理计划介绍"
        visible={introOpen}
        onCancel={() => setIntroOpen(false)}
        footer={null}
        width={960}
      >
        <IntroPage onApply={() => setIntroOpen(false)} leaderboard={leaderboard} />
      </Modal>
    </div>
  );
};

/* ================================================================== */
/*  邀请落地页（?invite=TOKEN）                                            */
/* ================================================================== */
const InviteLanding = ({ token, onAccepted, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await API.get(`/api/agent/invite/${token}`);
        if (!alive) return;
        if (r.data && r.data.success) setInfo(r.data.data);
        else setErr(r.data?.message || '邀请链接无效或已被使用');
      } catch (e) {
        if (alive) setErr('网络错误，请稍后再试');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    try {
      const r = await API.post(`/api/agent/invite/${token}/accept`);
      if (r.data && r.data.success) {
        Toast.success('🎉 已加入小组！');
        onAccepted && onAccepted();
      } else {
        Toast.error(r.data?.message || '加入失败');
      }
    } catch (e) {
      Toast.error('网络错误');
    } finally { setAccepting(false); }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (err) {
    return (
      <Card className="agent-glass agent-v3-content" style={{ maxWidth: 520, margin: '40px auto' }}>
        <Empty title="邀请无效" description={err} />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={onCancel}>返回代理首页</Button>
        </div>
      </Card>
    );
  }

  const sharePctNum = Math.round(toFrac(info?.share_pct_in_group || 0) * 100);

  return (
    <Card className="agent-glass agent-v3-content" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
      <Title heading={3} style={{ marginBottom: 4 }}>🎁 邀请加入小组</Title>
      <Text type="tertiary">有人邀请你加入他的代理小组</Text>
      <Divider />

      <div style={{ marginBottom: 20 }}>
        <Avatar src={info?.group_avatar} size="extra-large" style={{ background: 'linear-gradient(135deg, #C724B1, #4FC3F7)' }}>
          {info?.group_name?.[0] || 'G'}
        </Avatar>
        <Title heading={4} style={{ margin: '12px 0 4px' }}>{info?.group_name}</Title>
        {info?.group_slogan && (
          <Text type="tertiary" style={{ fontStyle: 'italic' }}>"{info.group_slogan}"</Text>
        )}
      </div>

      <Card style={{ background: 'linear-gradient(135deg,#fff5fa,#f0f7ff)', marginBottom: 20 }}>
        <Text type="tertiary">你将获得的分红比例</Text>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#C724B1', lineHeight: 1.2 }}>
          {sharePctNum}%
        </div>
        <Text type="tertiary" style={{ fontSize: 12 }}>
          基于小组分红额计算 · 由组长设定
        </Text>
      </Card>

      <Space>
        <Button theme="solid" type="primary" size="large" loading={accepting} onClick={accept}>
          ✅ 接受邀请并加入
        </Button>
        <Button size="large" onClick={onCancel}>暂不加入</Button>
      </Space>

      <Paragraph style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
        加入后你将看到组长的联系方式与收款码；
        小组本周排名会决定整体分红，加油一起冲榜！
      </Paragraph>
    </Card>
  );
};

/* ================================================================== */
/*  主组件                                                               */
/* ================================================================== */
const Agent = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [leader, setLeader] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [phase, setPhase] = useState('intro'); // intro | profile-form | group-create | leader | member
  // 邀请落地：从 URL 读 ?invite=TOKEN
  const [inviteToken, setInviteToken] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('invite') || ''; }
    catch { return ''; }
  });

  useEffect(() => { injectStyles(); }, []);

  const loadAll = async () => {
    setLoading(true);
    let profileData = null;
    try {
      const r = await API.get('/api/agent/profile').catch(() => null);
      if (!r || !r.data || !r.data.success || !r.data.data) {
        setPhase('intro');
        setLoading(false);
        return;
      }
      profileData = r.data.data;
      // 后端缺 avatar 列：用 localStorage 兜底注入到 profile.avatar_url
      if (!profileData.avatar_url && !profileData.avatar) {
        const cached = readAvatar(profileData.user_id);
        if (cached) profileData.avatar_url = cached;
      }
      setProfile(profileData);

      const gr = await API.get('/api/agent/group').catch(() => null);
      if (!gr || !gr.data || !gr.data.success || !gr.data.data) {
        setPhase('group-create');
        setLoading(false);
        return;
      }
      // 后端返回结构: { group: {...小组本体...}, is_leader, me, members: [...] }
      const raw = gr.data.data;
      const g = raw.group || raw;
      setGroup(g);
      const isLeader = !!raw.is_leader;
      const rawMembers = Array.isArray(raw.members) ? raw.members : [];

      if (isLeader) {
        const mr = await API.get('/api/agent/group/members-profiles').catch(() => null);
        if (mr && mr.data && mr.data.success) {
          setMembers(mr.data.data || []);
        } else {
          setMembers(rawMembers);
        }
        setPhase('leader');
      } else {
        setMembers(rawMembers);
        const lr = await API.get('/api/agent/group/leader-profile').catch(() => null);
        if (lr && lr.data && lr.data.success) setLeader(lr.data.data);
        setPhase('member');
      }
    } catch (e) {
      console.error(e);
      if (profileData) setPhase('group-create');
      else setPhase('intro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleApply = () => setPhase('profile-form');

  const handleSaveProfile = async (vals) => {
    const r = await API.post('/api/agent/profile', vals);
    if (!r.data.success) { Toast.error(r.data.message || '保存失败'); return; }
    Toast.success('资料已保存');
    await loadAll();
  };

  const handleCreateGroup = async (vals) => {
    const r = await API.post('/api/agent/group', vals);
    if (!r.data.success) { Toast.error(r.data.message || '创建失败'); return; }
    Toast.success('小组已创建');
    await loadAll();
  };

  return (
    <div className="agent-v3-root">
      <DebugPanel data={{ phase, profile, group, members, leader, leaderboard, inviteToken, _hint: 'v15: 邀请落地 ?invite=TOKEN' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {inviteToken ? (
          <InviteLanding
            token={inviteToken}
            onAccepted={() => {
              try { window.history.replaceState({}, '', window.location.pathname); } catch {}
              setInviteToken('');
              loadAll();
            }}
            onCancel={() => {
              try { window.history.replaceState({}, '', window.location.pathname); } catch {}
              setInviteToken('');
            }}
          />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : phase === 'intro' ? (
          <IntroPage onApply={handleApply} leaderboard={leaderboard} />
        ) : phase === 'profile-form' ? (
          <ProfileForm onSave={handleSaveProfile} onCancel={() => setPhase('intro')} />
        ) : phase === 'group-create' ? (
          <GroupCreateForm onSave={handleCreateGroup} />
        ) : phase === 'leader' ? (
          <LeaderDashboard
            profile={profile} group={group} members={members}
            leaderboard={leaderboard} reload={loadAll}
          />
        ) : (
          <MemberDashboard
            profile={profile} group={group} leader={leader}
            leaderboard={leaderboard} reload={loadAll}
          />
        )}
      </div>
    </div>
  );
};

export default Agent;
