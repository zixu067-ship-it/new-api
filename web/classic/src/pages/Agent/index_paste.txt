import React, { useEffect, useState, useRef } from 'react';
import {
  Card, Button, Toast, Typography, Space, Spin, Tag, Banner,
  Modal, InputNumber, Divider, Avatar, Input, Form, Tabs, TabPane,
  Steps, Step, Descriptions,
} from '@douyinfe/semi-ui';
import {
  IconUser, IconPhone, IconLink, IconGift, IconCopy,
  IconUserGroup, IconPlus, IconSetting, IconQrCode, IconStar,
  IconCrown, IconExit, IconRefresh,
} from '@douyinfe/semi-icons';
import { API } from '../../helpers';

const { Title, Text, Paragraph } = Typography;

/* ------------------------------------------------------------------ */
/*  小工具                                                               */
/* ------------------------------------------------------------------ */
const fmtDiscount = (v) => {
  const n = Math.round(parseFloat(v) * 100);
  return isNaN(n) ? '--' : n;
};

const copyText = (text) =>
  navigator.clipboard.writeText(text).then(() => Toast.success('已复制'));

/* ------------------------------------------------------------------ */
/*  主组件                                                               */
/* ------------------------------------------------------------------ */
const Agent = () => {
  /* ---------- 基础状态 ---------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);         // 我的代理资料
  const [isAgent, setIsAgent] = useState(false);
  const [groupData, setGroupData] = useState(null);     // 小组数据（含 my_role）
  const [members, setMembers] = useState([]);           // 组员列表（组长可见）
  const [leaderInfo, setLeaderInfo] = useState(null);   // 组长信息（组员可见）
  const [leaderboard, setLeaderboard] = useState([]);   // 排行榜

  /* ---------- 表单 ---------- */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [payQr, setPayQr] = useState('');

  /* ---------- 小组创建/编辑 ---------- */
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [gName, setGName] = useState('');
  const [gSlogan, setGSlogan] = useState('');
  const [gMsg, setGMsg] = useState('');
  const [gAvatar, setGAvatar] = useState('');
  const [gDefDiscount, setGDefDiscount] = useState(0.95);
  const [gRecDiscount, setGRecDiscount] = useState(0.95);

  /* ---------- 邀请链接 ---------- */
  const [inviteVisible, setInviteVisible] = useState(false);
  const [invitePct, setInvitePct] = useState(20);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  /* ---------- 弹窗 ---------- */
  const [lbVisible, setLbVisible] = useState(false);
  const [kickId, setKickId] = useState(null);
  const [leaveVisible, setLeaveVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [transferToId, setTransferToId] = useState(null);
  const [editShareMember, setEditShareMember] = useState(null);
  const [editSharePct, setEditSharePct] = useState(0);

  /* ================================================================== */
  /*  初始化                                                              */
  /* ================================================================== */
  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const r = await API.get('/api/agent/profile');
      if (r.data.success && r.data.data) {
        const p = r.data.data;
        setProfile(p);
        setIsAgent(true);
        setName(p.real_name || '');
        setPhone(p.phone || '');
        setWechat(p.wechat_id || '');
        setPayQr(p.payment_qr_url || '');

        const gr = await API.get('/api/agent/group');
        if (gr.data.success && gr.data.data) {
          const gd = gr.data.data;
          setGroupData(gd);
          prefillGroupForm(gd);
          if (gd.my_role === 'leader') {
            const mr = await API.get('/api/agent/group/members-profiles');
            if (mr.data.success) setMembers(mr.data.data || []);
          } else if (gd.my_role === 'member') {
            const lr = await API.get('/api/agent/group/leader-profile');
            if (lr.data.success) setLeaderInfo(lr.data.data);
          }
        }
      }
    } catch (_) {}
    try {
      const lb = await API.get('/api/agent/leaderboard');
      if (lb.data.success) setLeaderboard(lb.data.data || []);
    } catch (_) {}
    setLoading(false);
  };

  const prefillGroupForm = (gd) => {
    if (!gd) return;
    setGName(gd.group_name || '');
    setGSlogan(gd.slogan || '');
    setGMsg(gd.message_to_members || '');
    setGAvatar(gd.avatar_url || '');
    setGDefDiscount(parseFloat(gd.default_discount) || 0.95);
    setGRecDiscount(parseFloat(gd.recommend_discount) || 0.95);
  };

  /* ================================================================== */
  /*  保存代理资料                                                         */
  /* ================================================================== */
  const saveProfile = async () => {
    if (!name.trim() || !phone.trim() || !wechat.trim()) {
      Toast.error('姓名、手机号、微信号为必填项');
      return;
    }
    setSaving(true);
    try {
      const r = await API.post('/api/agent/profile', {
        real_name: name, phone, wechat_id: wechat, payment_qr_url: payQr,
      });
      if (r.data.success) {
        Toast.success(isAgent ? '资料更新成功' : '恭喜！已成为代理');
        setIsAgent(true);
        setProfile({ real_name: name, phone, wechat_id: wechat, payment_qr_url: payQr });
      } else {
        Toast.error(r.data.message || '保存失败');
      }
    } catch (_) { Toast.error('网络错误'); }
    setSaving(false);
  };

  /* ================================================================== */
  /*  创建小组                                                            */
  /* ================================================================== */
  const createGroup = async () => {
    if (!gName.trim()) { Toast.error('请填写小组名称'); return; }
    try {
      const r = await API.post('/api/agent/group', {
        group_name: gName, slogan: gSlogan, message_to_members: gMsg,
        avatar_url: gAvatar,
        default_discount: gDefDiscount,
        recommend_discount: gRecDiscount,
      });
      if (r.data.success) {
        Toast.success('小组创建成功！默认分红比例 25%');
        setCreateVisible(false);
        await loadAll();
      } else { Toast.error(r.data.message); }
    } catch (_) { Toast.error('网络错误'); }
  };

  /* ================================================================== */
  /*  编辑小组                                                            */
  /* ================================================================== */
  const updateGroup = async () => {
    try {
      const r = await API.put('/api/agent/group', {
        group_name: gName, slogan: gSlogan, message_to_members: gMsg,
        avatar_url: gAvatar,
        default_discount: gDefDiscount,
        recommend_discount: gRecDiscount,
      });
      if (r.data.success) {
        Toast.success('小组信息已更新');
        setEditVisible(false);
        await loadAll();
      } else { Toast.error(r.data.message); }
    } catch (_) { Toast.error('网络错误'); }
  };

  /* ================================================================== */
  /*  生成邀请链接                                                         */
  /* ================================================================== */
  const genInvite = async () => {
    if (invitePct < 1 || invitePct > 99) { Toast.error('占比须在 1–99 之间'); return; }
    setInviteLoading(true);
    try {
      const r = await API.post('/api/agent/group/invite', { share_pct_in_group: invitePct });
      if (r.data.success) {
        const token = r.data.data.invite_token;
        setInviteUrl(`${window.location.origin}/agent/join/${token}`);
        Toast.success('链接生成成功，可重复生成不同占比的链接');
      } else { Toast.error(r.data.message || '生成失败'); }
    } catch (_) { Toast.error('网络错误'); }
    setInviteLoading(false);
  };

  /* ================================================================== */
  /*  其他操作                                                            */
  /* ================================================================== */
  const kickMember = async () => {
    try {
      const r = await API.delete(`/api/agent/group/member/${kickId}`);
      if (r.data.success) { Toast.success('已移出'); setKickId(null); await loadAll(); }
      else Toast.error(r.data.message);
    } catch (_) { Toast.error('网络错误'); }
  };

  const leaveGroup = async () => {
    try {
      const r = await API.delete('/api/agent/group/leave');
      if (r.data.success) { Toast.success('已退出小组'); setLeaveVisible(false); await loadAll(); }
      else Toast.error(r.data.message);
    } catch (_) { Toast.error('网络错误'); }
  };

  const transferLeader = async () => {
    if (!transferToId) { Toast.error('请选择要转让的组员'); return; }
    try {
      const r = await API.post('/api/agent/group/transfer', { new_leader_id: transferToId });
      if (r.data.success) { Toast.success('已转让组长'); setTransferVisible(false); await loadAll(); }
      else Toast.error(r.data.message);
    } catch (_) { Toast.error('网络错误'); }
  };

  const updateShare = async () => {
    try {
      const r = await API.put(`/api/agent/group/member/${editShareMember.user_id}`, {
        share_pct_in_group: editSharePct,
      });
      if (r.data.success) { Toast.success('已更新'); setEditShareMember(null); await loadAll(); }
      else Toast.error(r.data.message);
    } catch (_) { Toast.error('网络错误'); }
  };

  /* ================================================================== */
  /*  Loading                                                            */
  /* ================================================================== */
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Spin size='large' />
    </div>
  );

  /* ================================================================== */
  /*  渲染                                                                */
  /* ================================================================== */
  const isLeader = groupData?.my_role === 'leader';
  const isMember = groupData?.my_role === 'member';
  const sharePct = groupData?.current_share_pct || 25;
  const mirrorLink = groupData ? `${window.location.origin}/g/${groupData.group_code}` : '';

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: 860, margin: '0 auto' }}>

      {/* =========================================================== */}
      {/* 顶部横幅                                                       */}
      {/* =========================================================== */}
      <div style={{
        borderRadius: 14,
        background: 'linear-gradient(135deg,#4776e6,#8e54e9)',
        padding: '24px 28px',
        marginBottom: 24,
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 6px 24px rgba(71,118,230,.35)',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            <IconGift style={{ marginRight: 10, verticalAlign: 'middle' }} />
            代理中心
          </div>
          <div style={{ opacity: 0.85, fontSize: 14 }}>
            推广赚分红 · 每周结算 · 前五名额外 +10%
          </div>
        </div>
        {groupData && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{sharePct}%</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>本组分红比例</div>
            {sharePct > 25 && (
              <span style={{
                display: 'inline-block', marginTop: 6, padding: '2px 8px',
                background: 'rgba(255,200,0,.25)', borderRadius: 20, fontSize: 12,
              }}>🏆 排行奖励</span>
            )}
          </div>
        )}
      </div>

      {/* =========================================================== */}
      {/* 排行榜入口                                                      */}
      {/* =========================================================== */}
      <div
        onClick={() => setLbVisible(true)}
        style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg,#f7971e,#ffd200)',
          padding: '14px 20px',
          marginBottom: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 14px rgba(247,151,30,.3)',
          userSelect: 'none',
        }}
      >
        <Space>
          <IconStar style={{ fontSize: 26, color: '#fff' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>本周推广排行榜</div>
            <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 12 }}>
              前五名额外 +10% 分红，上限 70%，每周一自动结算
            </div>
          </div>
        </Space>
        <span style={{ color: '#fff', fontSize: 22 }}>›</span>
      </div>

      {/* =========================================================== */}
      {/* 代理资料                                                       */}
      {/* =========================================================== */}
      <Card
        style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.07)' }}
        title={
          <Space>
            <IconUser />
            <span>我的代理资料</span>
            {isAgent && <Tag color='green' size='small'>已认证</Tag>}
          </Space>
        }
      >
        {!isAgent && (
          <Banner
            type='info'
            description='填写下方资料并提交，即可成为代理。姓名、手机号、微信号必填。'
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>真实姓名 *</div>
            <Input value={name} onChange={setName} placeholder='必填' />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>手机号 *</div>
            <Input value={phone} onChange={setPhone} placeholder='必填' />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>微信号 *</div>
            <Input value={wechat} onChange={setWechat} placeholder='必填，用于联系和发工资' />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>收款码图片链接</div>
            <Input value={payQr} onChange={setPayQr} placeholder='https://... 选填，组长可见' />
          </div>
        </div>
        <Button
          theme='solid' type='primary' loading={saving}
          onClick={saveProfile}
          style={{ marginTop: 14, borderRadius: 8, paddingLeft: 28, paddingRight: 28 }}
        >
          {isAgent ? '保存修改' : '提交成为代理'}
        </Button>
      </Card>

      {/* =========================================================== */}
      {/* 未加入小组                                                      */}
      {/* =========================================================== */}
      {isAgent && !groupData && (
        <Card
          style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.07)' }}
          title={<Space><IconUserGroup /><span>推广小组</span></Space>}
        >
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <Text type='secondary' style={{ display: 'block', marginBottom: 20 }}>
              创建小组后可邀请代理加入，共同推广，按周分红。
              <br />小组默认分红比例 25%，排行榜前五额外 +10%，上限 70%。
            </Text>
            <Button
              icon={<IconPlus />} theme='solid' type='primary'
              onClick={() => setCreateVisible(true)}
              style={{ borderRadius: 8 }}
            >
              创建推广小组
            </Button>
          </div>
        </Card>
      )}

      {/* =========================================================== */}
      {/* 小组信息（已加入）                                               */}
      {/* =========================================================== */}
      {groupData && (
        <Card
          style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.07)' }}
          title={
            <Space>
              {groupData.avatar_url
                ? <Avatar src={groupData.avatar_url} size='small' shape='square' />
                : <Avatar size='small' style={{ background: '#4776e6' }}>
                    {(groupData.group_name || '组').charAt(0)}
                  </Avatar>
              }
              <span>{groupData.group_name}</span>
              <Tag color={isLeader ? 'orange' : 'blue'} size='small'>
                {isLeader ? '👑 组长' : '组员'}
              </Tag>
            </Space>
          }
          extra={
            isLeader && (
              <Button
                size='small' icon={<IconSetting />} theme='light'
                onClick={() => { prefillGroupForm(groupData); setEditVisible(true); }}
              >
                编辑
              </Button>
            )
          }
        >
          {/* 小组头像 + 信息 */}
          <div style={{
            display: 'flex', gap: 20, alignItems: 'flex-start',
            background: '#f8f9ff', borderRadius: 10, padding: '16px 20px', marginBottom: 20,
          }}>
            {groupData.avatar_url
              ? <Avatar src={groupData.avatar_url} size='extra-large' shape='square' style={{ flexShrink: 0 }} />
              : <Avatar size='extra-large' shape='square' style={{ background: '#4776e6', fontSize: 26, flexShrink: 0 }}>
                  {(groupData.group_name || '组').charAt(0)}
                </Avatar>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{groupData.group_name}</div>
              {groupData.slogan && (
                <div style={{ color: '#888', fontSize: 13, fontStyle: 'italic', marginBottom: 10 }}>
                  "{groupData.slogan}"
                </div>
              )}
              <Space wrap>
                <Tag color='green'>默认折扣 {fmtDiscount(groupData.default_discount)}折</Tag>
                <Tag color='cyan'>推荐折扣 {fmtDiscount(groupData.recommend_discount)}折</Tag>
                <Tag color='violet'>本组分红 {sharePct}%</Tag>
              </Space>
            </div>
          </div>

          {/* 分红说明 */}
          {isLeader ? (
            <Banner
              type='success'
              description={
                <span>
                  平台每周拨付总利润的 <strong>{sharePct}%</strong> 给本小组。
                  排行榜前五可额外 +10%，上限 70%。
                </span>
              }
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          ) : (
            <Banner
              type='info'
              description={
                <span>
                  你在本组的分润占比：<strong>{groupData.my_share_pct_in_group}%</strong>
                  （每周分成总额 × {groupData.my_share_pct_in_group}% 归你）
                </span>
              }
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {/* 组长寄语（仅组员可见） */}
          {isMember && groupData.message_to_members && (
            <Banner
              type='warning'
              description={<span>💬 组长寄语：{groupData.message_to_members}</span>}
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {/* 推广镜像链接 */}
          <div style={{
            background: '#f0f5ff', border: '1px solid #c8d8ff',
            borderRadius: 10, padding: '14px 18px', marginBottom: 20,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              <IconLink style={{ marginRight: 6, verticalAlign: 'middle' }} />
              推广专属镜像链接
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <code style={{
                flex: 1, background: '#e8eeff', padding: '6px 10px',
                borderRadius: 6, fontSize: 13, wordBreak: 'break-all',
                border: '1px solid #d0d9ff',
              }}>
                {mirrorLink}
              </code>
              <Button size='small' theme='solid' icon={<IconCopy />} onClick={() => copyText(mirrorLink)}>
                复制
              </Button>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
              通过此链接注册的用户自动归入本小组，享受专属折扣
            </div>
          </div>

          {/* 组长：生成邀请链接 */}
          {isLeader && (
            <div style={{ marginBottom: 20 }}>
              <Button
                icon={<IconLink />} type='primary' theme='light'
                onClick={() => { setInviteVisible(true); setInviteUrl(''); }}
                style={{ borderRadius: 8 }}
              >
                生成组员邀请链接
              </Button>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                可重复生成，每次可设置不同的分润占比
              </div>
            </div>
          )}

          {/* 组长：组员列表 */}
          {isLeader && (
            <>
              <Divider />
              <div style={{ marginTop: 16 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 12,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    组员列表
                    {members.length > 0 && (
                      <Tag color='blue' size='small' style={{ marginLeft: 8 }}>{members.length} 人</Tag>
                    )}
                  </span>
                </div>
                {members.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#bbb' }}>
                    暂无组员，生成邀请链接发给代理即可邀请加入
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {members.map((m) => (
                      <div key={m.user_id} style={{
                        background: '#fafafa', border: '1px solid #f0f0f0',
                        borderRadius: 10, padding: '14px 16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      }}>
                        <Space align='start' style={{ gap: 12 }}>
                          <Avatar style={{ background: '#8e54e9', flexShrink: 0 }}>
                            {(m.real_name || '?').charAt(0)}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                              {m.real_name || '未填写姓名'}
                            </div>
                            <div style={{ color: '#666', fontSize: 13 }}>
                              📱 {m.phone || '未填写'} &nbsp;&nbsp; 💬 {m.wechat_id || '未填写'}
                            </div>
                            <div style={{ fontSize: 13, marginTop: 4 }}>
                              在组占比：<strong style={{ color: '#4776e6' }}>{m.share_pct_in_group}%</strong>
                            </div>
                            {m.payment_qr_url && (
                              <Button
                                size='small' theme='borderless' icon={<IconQrCode />}
                                onClick={() => window.open(m.payment_qr_url, '_blank')}
                                style={{ paddingLeft: 0, marginTop: 4 }}
                              >
                                查看收款码
                              </Button>
                            )}
                          </div>
                        </Space>
                        <Space vertical style={{ gap: 6, flexShrink: 0 }}>
                          <Button
                            size='small' theme='light' type='primary'
                            onClick={() => { setEditShareMember(m); setEditSharePct(m.share_pct_in_group); }}
                          >
                            改占比
                          </Button>
                          <Button
                            size='small' type='danger' theme='borderless'
                            onClick={() => setKickId(m.user_id)}
                          >
                            踢出
                          </Button>
                        </Space>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 组员：组长联系方式 */}
          {isMember && leaderInfo && (
            <>
              <Divider />
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>👑 组长联系方式</div>
                <div style={{
                  background: '#fffbf0', border: '1px solid #ffe4a0',
                  borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <Avatar size='large' style={{ background: '#f7971e', flexShrink: 0 }}>
                    {(leaderInfo.real_name || '组').charAt(0)}
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{leaderInfo.real_name || '未填写'}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      📱 {leaderInfo.phone || '未填写'}
                    </div>
                    <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                      💬 微信：{leaderInfo.wechat_id || '未填写'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 底部操作 */}
          <Divider />
          <div style={{ paddingTop: 8 }}>
            {isMember && (
              <Button type='danger' theme='borderless' icon={<IconExit />}
                onClick={() => setLeaveVisible(true)}>
                退出小组
              </Button>
            )}
            {isLeader && (
              <Button type='danger' theme='borderless' icon={<IconCrown />}
                onClick={() => setTransferVisible(true)}>
                转让组长并退出
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* =========================================================== */}
      {/* 排行榜 Modal                                                   */}
      {/* =========================================================== */}
      <Modal
        title={<Space><IconStar style={{ color: '#ffd200' }} /><span>本周推广排行榜</span></Space>}
        visible={lbVisible}
        onCancel={() => setLbVisible(false)}
        footer={<Button onClick={() => setLbVisible(false)}>关闭</Button>}
        width={540}
      >
        <Banner
          type='info'
          description='每周一 0:00 自动结算。排名前 5 的小组额外获得 +10% 分红，上限 70%。'
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb' }}>
            暂无排行数据
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((item, i) => (
              <div key={item.group_id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: i < 5 ? '#fffbee' : '#fafafa',
                border: `1px solid ${i < 5 ? '#ffe58f' : '#f0f0f0'}`,
                borderRadius: 10, padding: '12px 16px',
              }}>
                <div style={{ width: 28, textAlign: 'center', fontSize: 22 }}>
                  {['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}`}
                </div>
                {item.avatar_url
                  ? <Avatar src={item.avatar_url} size='small' shape='square' />
                  : <Avatar size='small' style={{ background: ['#ffd700','#c0c0c0','#cd7f32','#4776e6','#8e54e9'][i] || '#ccc' }}>
                      {(item.group_name || '组').charAt(0)}
                    </Avatar>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.group_name}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>
                    本周推广充值：¥{(item.week_revenue || 0).toFixed(2)}
                  </div>
                </div>
                {i < 5 && <Tag color='amber' size='small'>+10% 分红</Tag>}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* =========================================================== */}
      {/* 创建小组 Modal                                                  */}
      {/* =========================================================== */}
      <Modal
        title={<Space><IconPlus /><span>创建推广小组</span></Space>}
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onOk={createGroup}
        okText='创建小组'
        width={520}
      >
        <Banner
          type='success'
          description='小组创建后默认分红比例 25%，进入排行榜前五可额外 +10%，上限 70%。'
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>小组名称 *</div>
            <Input value={gName} onChange={setGName} placeholder='必填' />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>宣传语 / 口号</div>
            <Input value={gSlogan} onChange={setGSlogan} placeholder='选填，展示在推广页' />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>给组员的话</div>
            <Input value={gMsg} onChange={setGMsg} placeholder='选填，仅组员可见' />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>小组头像图片链接</div>
            <Input value={gAvatar} onChange={setGAvatar} placeholder='https://... 选填' />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>默认折扣（如 0.95 = 95折）</div>
              <InputNumber value={gDefDiscount} onChange={setGDefDiscount} min={0.1} max={1} step={0.01} style={{ width: '100%' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>推荐折扣</div>
              <InputNumber value={gRecDiscount} onChange={setGRecDiscount} min={0.1} max={1} step={0.01} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </Modal>

      {/* =========================================================== */}
      {/* 编辑小组 Modal                                                  */}
      {/* =========================================================== */}
      <Modal
        title={<Space><IconSetting /><span>编辑小组信息</span></Space>}
        visible={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={updateGroup}
        okText='保存修改'
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>小组名称</div>
            <Input value={gName} onChange={setGName} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>宣传语 / 口号</div>
            <Input value={gSlogan} onChange={setGSlogan} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>给组员的话</div>
            <Input value={gMsg} onChange={setGMsg} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>小组头像图片链接</div>
            <Input value={gAvatar} onChange={setGAvatar} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>默认折扣</div>
              <InputNumber value={gDefDiscount} onChange={setGDefDiscount} min={0.1} max={1} step={0.01} style={{ width: '100%' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>推荐折扣</div>
              <InputNumber value={gRecDiscount} onChange={setGRecDiscount} min={0.1} max={1} step={0.01} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </Modal>

      {/* =========================================================== */}
      {/* 生成邀请链接 Modal                                               */}
      {/* =========================================================== */}
      <Modal
        title={<Space><IconLink /><span>生成组员邀请链接</span></Space>}
        visible={inviteVisible}
        onCancel={() => setInviteVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setInviteVisible(false)}>关闭</Button>
            <Button theme='solid' loading={inviteLoading} onClick={genInvite} icon={<IconRefresh />}>
              生成链接
            </Button>
          </Space>
        }
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
            设置该组员在本组内的分润占比（1–99）：
          </div>
          <InputNumber
            value={invitePct} onChange={setInvitePct}
            min={1} max={99} suffix='%' style={{ width: 140 }}
          />
        </div>
        <Banner
          type='info'
          description={
            <span>
              该组员加入后将看到自己在组内占比为 <strong>{invitePct}%</strong>。
              实际金额 = 本组每周分成总额 × {invitePct}%。
              <br />
              <span style={{ fontSize: 12, color: '#aaa' }}>可重复生成，每次可设置不同占比</span>
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        {inviteUrl && (
          <div style={{
            background: '#f0f9eb', border: '1px solid #b7eb8f',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ color: '#52c41a', fontWeight: 600, marginBottom: 8 }}>✅ 邀请链接已生成：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{
                flex: 1, fontSize: 12, wordBreak: 'break-all',
                background: '#e8f8e0', padding: '6px 8px', borderRadius: 6,
              }}>
                {inviteUrl}
              </code>
              <Button size='small' theme='solid' icon={<IconCopy />} onClick={() => copyText(inviteUrl)}>
                复制
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================== */}
      {/* 踢出组员 Modal                                                  */}
      {/* =========================================================== */}
      <Modal
        title='移出组员'
        visible={!!kickId}
        onCancel={() => setKickId(null)}
        onOk={kickMember}
        okText='确认移出'
        okButtonProps={{ type: 'danger' }}
      >
        <Text>确定要将该组员移出小组吗？移出后推广记录仍然保留。</Text>
      </Modal>

      {/* =========================================================== */}
      {/* 退出小组 Modal                                                  */}
      {/* =========================================================== */}
      <Modal
        title='退出小组'
        visible={leaveVisible}
        onCancel={() => setLeaveVisible(false)}
        onOk={leaveGroup}
        okText='确认退出'
        okButtonProps={{ type: 'danger' }}
      >
        <Text>确定要退出当前小组吗？退出后推广记录仍然保留。</Text>
      </Modal>

      {/* =========================================================== */}
      {/* 转让组长 Modal                                                  */}
      {/* =========================================================== */}
      <Modal
        title='转让组长'
        visible={transferVisible}
        onCancel={() => setTransferVisible(false)}
        onOk={transferLeader}
        okText='确认转让'
      >
        <Text style={{ display: 'block', marginBottom: 12 }}>选择接任组长的组员：</Text>
        {members.length === 0 ? (
          <Text type='secondary'>暂无组员，请先邀请组员加入。</Text>
        ) : members.map((m) => (
          <div
            key={m.user_id}
            onClick={() => setTransferToId(m.user_id)}
            style={{
              padding: '10px 14px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
              border: `2px solid ${transferToId === m.user_id ? '#4776e6' : '#e0e0e0'}`,
              background: transferToId === m.user_id ? '#eef2ff' : '#fafafa',
            }}
          >
            <Text strong>{m.real_name || '未填写姓名'}</Text>
            <Text type='secondary' style={{ marginLeft: 8 }}>微信：{m.wechat_id || '未填写'}</Text>
          </div>
        ))}
      </Modal>

      {/* =========================================================== */}
      {/* 修改占比 Modal                                                  */}
      {/* =========================================================== */}
      <Modal
        title='修改组员分润占比'
        visible={!!editShareMember}
        onCancel={() => setEditShareMember(null)}
        onOk={updateShare}
        okText='保存'
      >
        <Text style={{ display: 'block', marginBottom: 8 }}>
          修改 <Text strong>{editShareMember?.real_name || '该组员'}</Text> 在组内的分润占比：
        </Text>
        <InputNumber
          value={editSharePct} onChange={setEditSharePct}
          min={1} max={99} suffix='%' style={{ width: 140 }}
        />
        <Banner
          type='warning'
          description='所有组员占比之和不应超过 100%，超出部分归组长所有。'
          style={{ marginTop: 12, borderRadius: 8 }}
        />
      </Modal>

    </div>
  );
};

export default Agent;
