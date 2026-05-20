import React, { useEffect, useState } from 'react';
import {
  Card, Button, Toast, Typography, Space, Spin, Tag, Banner,
  Modal, InputNumber, Divider, Avatar, Input, Layout, Nav, Descriptions,
  Form, Upload,
} from '@douyinfe/semi-ui';
import {
  IconUser, IconPhone, IconLink, IconGift, IconCopy,
  IconUserGroup, IconSetting, IconStar, IconHome, IconList,
} from '@douyinfe/semi-icons';
import { API } from '../../helpers';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const fmtDiscount = (v) => {
  const n = Math.round(parseFloat(v) * 100);
  return isNaN(n) ? '--' : n;
};

const copyText = (text) =>
  navigator.clipboard.writeText(text).then(() => Toast.success('已复制'));

const Agent = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team'); // team | leaderboard | payment | contact
  const [profile, setProfile] = useState(null);
  const [isAgent, setIsAgent] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [leaderInfo, setLeaderInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // 表单字段
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [payQr, setPayQr] = useState('');

  // 小组
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [gName, setGName] = useState('');
  const [gSlogan, setGSlogan] = useState('');
  const [gMsg, setGMsg] = useState('');
  const [gAvatar, setGAvatar] = useState('');
  const [gDefDiscount, setGDefDiscount] = useState(0.9);

  // 邀请
  const [inviteVisible, setInviteVisible] = useState(false);
  const [invitePct, setInvitePct] = useState(20);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // 其他
  const [kickId, setKickId] = useState(null);
  const [leaveVisible, setLeaveVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [transferToId, setTransferToId] = useState(null);
  const [editShareMember, setEditShareMember] = useState(null);
  const [editSharePct, setEditSharePct] = useState(0);

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
          setGName(gd.group_name || '');
          setGSlogan(gd.slogan || '');
          setGMsg(gd.message_to_members || '');
          setGAvatar(gd.avatar_url || '');
          setGDefDiscount(parseFloat(gd.default_discount) || 0.9);
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

  const saveProfile = async () => {
    if (!name.trim() || !phone.trim() || !wechat.trim()) {
      Toast.error('姓名、手机号、微信号为必填项');
      return;
    }
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
  };

  const createGroup = async () => {
    if (!gName.trim()) { Toast.error('请填写小组名称'); return; }
    if (gDefDiscount < 0.9) { Toast.error('最低折扣不能低于9折'); return; }
    try {
      const r = await API.post('/api/agent/group', {
        group_name: gName, slogan: gSlogan, message_to_members: gMsg,
        avatar_url: gAvatar, default_discount: gDefDiscount, recommend_discount: 0.95,
      });
      if (r.data.success) {
        Toast.success('小组创建成功！默认分红比例 25%');
        setCreateVisible(false);
        await loadAll();
      } else { Toast.error(r.data.message); }
    } catch (_) { Toast.error('网络错误'); }
  };

  const updateGroup = async () => {
    if (gDefDiscount < 0.9) { Toast.error('最低折扣不能低于9折'); return; }
    try {
      const r = await API.put('/api/agent/group', {
        group_name: gName, slogan: gSlogan, message_to_members: gMsg,
        avatar_url: gAvatar, default_discount: gDefDiscount, recommend_discount: 0.95,
      });
      if (r.data.success) {
        Toast.success('小组信息已更新');
        setEditVisible(false);
        await loadAll();
      } else { Toast.error(r.data.message); }
    } catch (_) { Toast.error('网络错误'); }
  };

  const genInvite = async () => {
    if (invitePct < 1 || invitePct > 99) { Toast.error('占比须在 1–99 之间'); return; }
    setInviteLoading(true);
    try {
      const r = await API.post('/api/agent/group/invite', { share_pct_in_group: invitePct });
      if (r.data.success) {
        const token = r.data.data.invite_token;
        setInviteUrl(`${window.location.origin}/agent/join/${token}`);
        Toast.success('链接生成成功');
      } else { Toast.error(r.data.message || '生成失败'); }
    } catch (_) { Toast.error('网络错误'); }
    setInviteLoading(false);
  };

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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Spin size='large' />
    </div>
  );

  const isLeader = groupData?.my_role === 'leader';
  const isMember = groupData?.my_role === 'member';
  const sharePct = groupData?.current_share_pct || 25;
  const mirrorLink = groupData ? `${window.location.origin}/g/${groupData.group_code}` : '';
  const myShareInGroup = isMember ? (groupData?.my_share_pct_in_group || 0) : 0;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      {/* 左侧导航 */}
      <Sider style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4776e6' }}>
            <IconGift style={{ marginRight: 8 }} />代理中心
          </div>
        </div>
        <Nav
          selectedKeys={[activeTab]}
          onSelect={(data) => setActiveTab(data.itemKey)}
          style={{ marginTop: 16 }}
          items={[
            { itemKey: 'team', text: '我的队伍', icon: <IconUserGroup /> },
            { itemKey: 'leaderboard', text: '排行榜', icon: <IconStar /> },
            { itemKey: 'payment', text: '收款设置', icon: <IconGift /> },
            ...(isLeader ? [{ itemKey: 'contact', text: '联系方式', icon: <IconList /> }] : []),
          ]}
        />
      </Sider>

      {/* 右侧内容 */}
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* 顶部横幅 */}
          <div style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            padding: '28px 32px',
            marginBottom: 24,
            color: '#fff',
            boxShadow: '0 8px 24px rgba(102,126,234,.3)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>欢迎回来，{name || '代理'}</div>
            <div style={{ opacity: 0.9, fontSize: 14 }}>推广赚分红 · 每周结算 · 前五名额外 +10%</div>
            {groupData && (
              <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>本组全站分红比例</div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>{sharePct}%</div>
                  {sharePct > 25 && <Tag color='amber' style={{ marginTop: 6 }}>🏆 排行奖励</Tag>}
                </div>
                {isMember && (
                  <div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>你在队伍内的分成比例</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>{myShareInGroup}%</div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>实际分红 = {sharePct}% × {myShareInGroup}% = {(sharePct * myShareInGroup / 100).toFixed(2)}%</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 我的队伍 */}
          {activeTab === 'team' && (
            <>
              {!groupData ? (
                <Card title='加入或创建队伍' style={{ marginBottom: 16 }}>
                  <Space>
                    <Button type='primary' icon={<IconUserGroup />} onClick={() => setCreateVisible(true)}>创建队伍</Button>
                    <Text type='tertiary'>或使用邀请链接加入现有队伍</Text>
                  </Space>
                </Card>
              ) : (
                <>
                  <Card
                    title={<Space><Avatar src={groupData.avatar_url} size='small'>{groupData.group_name?.[0]}</Avatar>{groupData.group_name}</Space>}
                    headerExtraContent={isLeader && <Button size='small' onClick={() => setEditVisible(true)}>编辑</Button>}
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions row data={[
                      { key: '宣传语', value: groupData.slogan || '--' },
                      { key: '组长寄语', value: groupData.message_to_members || '--' },
                      { key: '最低折扣', value: `${fmtDiscount(groupData.default_discount)}折` },
                      { key: '推荐折扣', value: '95折（固定）' },
                      { key: '镜像站链接', value: <a onClick={() => copyText(mirrorLink)}>{mirrorLink} <IconCopy /></a> },
                    ]} />
                    {isLeader && (
                      <div style={{ marginTop: 16 }}>
                        <Button icon={<IconLink />} onClick={() => setInviteVisible(true)}>生成邀请链接</Button>
                        <Divider margin='16px' />
                        <Title heading={6}>队员列表</Title>
                        {members.map(m => (
                          <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <Space>
                              <Text>{m.real_name}</Text>
                              <Tag>{m.share_pct_in_group}%</Tag>
                            </Space>
                            <Space>
                              <Button size='small' onClick={() => { setEditShareMember(m); setEditSharePct(m.share_pct_in_group); }}>改分成</Button>
                              <Button size='small' type='danger' onClick={() => setKickId(m.user_id)}>移出</Button>
                            </Space>
                          </div>
                        ))}
                      </div>
                    )}
                    {isMember && (
                      <div style={{ marginTop: 16 }}>
                        <Button type='tertiary' onClick={() => setLeaveVisible(true)}>退出队伍</Button>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </>
          )}

          {/* 排行榜 */}
          {activeTab === 'leaderboard' && (
            <Card title={<Space><IconStar style={{ color: '#ffd700' }} />本周推广排行榜</Space>}>
              <Banner type='info' description='每周一 0:00 自动结算。排名前 5 的小组额外获得 +10% 分红，上限 70%。' style={{ marginBottom: 16 }} />
              {leaderboard.length === 0 ? (
                <Text type='tertiary'>暂无数据</Text>
              ) : (
                leaderboard.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Space>
                      <Text strong>#{idx + 1}</Text>
                      <Text>{item.group_name}</Text>
                    </Space>
                    <Space>
                      <Text type='tertiary'>充值 ¥{item.weekly_recharge || 0}</Text>
                      <Tag color={idx < 5 ? 'amber' : 'grey'}>{item.current_share_pct}%</Tag>
                    </Space>
                  </div>
                ))
              )}
            </Card>
          )}

          {/* 收款设置 */}
          {activeTab === 'payment' && (
            <Card title='收款方式设置'>
              <Form labelPosition='left' labelWidth={100}>
                <Form.Input field='name' label={<span><span style={{ color: 'red' }}>*</span> 真实姓名</span>} value={name} onChange={setName} placeholder='用于结算' />
                <Form.Input field='phone' label={<span><span style={{ color: 'red' }}>*</span> 手机号</span>} value={phone} onChange={setPhone} />
                <Form.Input field='wechat' label={<span><span style={{ color: 'red' }}>*</span> 微信号</span>} value={wechat} onChange={setWechat} />
                <Form.Input field='payQr' label='收款码URL' value={payQr} onChange={setPayQr} placeholder='微信/支付宝收款码图片链接' />
                <Button type='primary' onClick={saveProfile} style={{ marginTop: 16 }}>保存</Button>
              </Form>
            </Card>
          )}

          {/* 联系方式（组长） */}
          {activeTab === 'contact' && isLeader && (
            <Card title='队员联系方式'>
              {members.map(m => (
                <div key={m.user_id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Descriptions row size='small' data={[
                    { key: '姓名', value: m.real_name },
                    { key: '手机', value: m.phone },
                    { key: '微信', value: m.wechat_id },
                    { key: '收款码', value: m.payment_qr_url ? <a href={m.payment_qr_url} target='_blank'>查看</a> : '--' },
                  ]} />
                </div>
              ))}
            </Card>
          )}
        </div>
      </Content>

      {/* Modals */}
      <Modal title='创建队伍' visible={createVisible} onCancel={() => setCreateVisible(false)} onOk={createGroup}>
        <Form labelPosition='left'>
          <Form.Input field='gName' label={<span><span style={{ color: 'red' }}>*</span> 队伍名称</span>} value={gName} onChange={setGName} />
          <Form.Input field='gSlogan' label='宣传语' value={gSlogan} onChange={setGSlogan} />
          <Form.TextArea field='gMsg' label='组长寄语' value={gMsg} onChange={setGMsg} />
          <Form.Input field='gAvatar' label='头像URL' value={gAvatar} onChange={setGAvatar} placeholder='图片链接' />
          <Form.Slot label='最低折扣'>
            <InputNumber value={gDefDiscount} onChange={setGDefDiscount} min={0.9} max={1} step={0.01} suffix='折' />
            <Text type='tertiary' size='small' style={{ display: 'block', marginTop: 4 }}>不能低于9折</Text>
          </Form.Slot>
          <Form.Slot label='推荐折扣'>
            <Text>95折（固定）</Text>
          </Form.Slot>
        </Form>
      </Modal>

      <Modal title='编辑队伍' visible={editVisible} onCancel={() => setEditVisible(false)} onOk={updateGroup}>
        <Form labelPosition='left'>
          <Form.Input field='gName' label='队伍名称' value={gName} onChange={setGName} />
          <Form.Input field='gSlogan' label='宣传语' value={gSlogan} onChange={setGSlogan} />
          <Form.TextArea field='gMsg' label='组长寄语' value={gMsg} onChange={setGMsg} />
          <Form.Input field='gAvatar' label='头像URL' value={gAvatar} onChange={setGAvatar} />
          <Form.Slot label='最低折扣'>
            <InputNumber value={gDefDiscount} onChange={setGDefDiscount} min={0.9} max={1} step={0.01} />
          </Form.Slot>
        </Form>
      </Modal>

      <Modal title='生成邀请链接' visible={inviteVisible} onCancel={() => setInviteVisible(false)} footer={null}>
        <Form labelPosition='left'>
          <Form.Slot label='队伍内分成比例'>
            <InputNumber value={invitePct} onChange={setInvitePct} min={1} max={99} suffix='%' style={{ width: 120 }} />
            <Text type='tertiary' size='small' style={{ display: 'block', marginTop: 4 }}>新成员在队伍内的分成占比（1-99%）</Text>
          </Form.Slot>
          <Button type='primary' onClick={genInvite} loading={inviteLoading} style={{ marginTop: 8 }}>生成链接</Button>
          {inviteUrl && (
            <div style={{ marginTop: 16, padding: 12, background: '#f7f8fa', borderRadius: 6 }}>
              <Text copyable>{inviteUrl}</Text>
            </div>
          )}
        </Form>
      </Modal>

      <Modal title='确认移出' visible={!!kickId} onCancel={() => setKickId(null)} onOk={kickMember}>
        确定要移出该队员吗？
      </Modal>

      <Modal title='确认退出' visible={leaveVisible} onCancel={() => setLeaveVisible(false)} onOk={leaveGroup}>
        确定要退出队伍吗？
      </Modal>

      <Modal title='转让组长' visible={transferVisible} onCancel={() => setTransferVisible(false)} onOk={transferLeader}>
        <Form.Select field='transferTo' label='选择新组长' value={transferToId} onChange={setTransferToId} optionList={members.map(m => ({ label: m.real_name, value: m.user_id }))} />
      </Modal>

      <Modal title='修改分成比例' visible={!!editShareMember} onCancel={() => setEditShareMember(null)} onOk={updateShare}>
        <Form.Slot label='队伍内分成比例'>
          <InputNumber value={editSharePct} onChange={setEditSharePct} min={1} max={99} suffix='%' />
        </Form.Slot>
      </Modal>
    </Layout>
  );
};

export default Agent;
