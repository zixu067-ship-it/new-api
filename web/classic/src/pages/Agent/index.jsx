import React, { useEffect, useState } from 'react';
import {
  Card, Form, Button, Toast, Typography, Space, Spin, Tag, Banner,
  Modal, InputNumber, Divider, List, Avatar,
} from '@douyinfe/semi-ui';
import {
  IconUser, IconPhone, IconLink, IconGift, IconCopy,
  IconUserGroup, IconPlus, IconSetting, IconQrCode,
} from '@douyinfe/semi-icons';
import { API } from '../../helpers';

const { Title, Text } = Typography;

const Agent = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAgent, setIsAgent] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteSharePct, setInviteSharePct] = useState(20);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [leaderProfile, setLeaderProfile] = useState(null);
  const [membersProfiles, setMembersProfiles] = useState([]);
  const [kickVisible, setKickVisible] = useState(false);
  const [kickMemberId, setKickMemberId] = useState(null);
  const [leaveVisible, setLeaveVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [transferToId, setTransferToId] = useState(null);
  const [editShareVisible, setEditShareVisible] = useState(false);
  const [editShareMember, setEditShareMember] = useState(null);
  const [editSharePct, setEditSharePct] = useState(0);
  const formRef = React.createRef();
  const groupFormRef = React.createRef();
  const editGroupFormRef = React.createRef();

  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/agent/profile');
      if (res.data.success) {
        setProfile(res.data.data);
        setIsAgent(true);
        const gRes = await API.get('/api/agent/group');
        if (gRes.data.success) {
          const gd = gRes.data.data;
          setGroupData(gd);
          if (gd) {
            if (gd.my_role === 'member') {
              const lRes = await API.get('/api/agent/group/leader-profile');
              if (lRes.data.success) setLeaderProfile(lRes.data.data);
            }
            if (gd.my_role === 'leader') {
              const mRes = await API.get('/api/agent/group/members-profiles');
              if (mRes.data.success) setMembersProfiles(mRes.data.data || []);
            }
          }
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleSubmitProfile = async () => {
    const values = formRef.current.formApi.getValues();
    if (!values.real_name || !values.phone || !values.wechat_id) {
      Toast.error('姓名、手机号、微信号为必填项');
      return;
    }
    setSubmitting(true);
    try {
      const res = await API.post('/api/agent/profile', values);
      if (res.data.success) {
        Toast.success(isAgent ? '资料更新成功！' : '恭喜你！你已成为代理');
        setProfile(values);
        setIsAgent(true);
      } else {
        Toast.error(res.data.message || '保存失败');
      }
    } catch (e) { Toast.error('网络错误'); }
    setSubmitting(false);
  };

  const handleCreateGroup = async () => {
    const values = groupFormRef.current.formApi.getValues();
    if (!values.group_name) { Toast.error('请填写小组名称'); return; }
    try {
      const res = await API.post('/api/agent/group', {
        group_name: values.group_name,
        slogan: values.slogan || '',
        message_to_members: values.message_to_members || '',
        avatar_url: values.avatar_url || '',
        default_discount: parseFloat(values.default_discount) || 0.95,
        recommend_discount: parseFloat(values.recommend_discount) || 0.95,
      });
      if (res.data.success) {
        Toast.success('小组创建成功！');
        setCreateGroupVisible(false);
        await init();
      } else { Toast.error(res.data.message); }
    } catch (e) { Toast.error('网络错误'); }
  };

  const handleUpdateGroup = async () => {
    const values = editGroupFormRef.current.formApi.getValues();
    try {
      const res = await API.put('/api/agent/group', {
        ...values,
        default_discount: parseFloat(values.default_discount) || 0.95,
        recommend_discount: parseFloat(values.recommend_discount) || 0.95,
      });
      if (res.data.success) {
        Toast.success('更新成功');
        setEditGroupVisible(false);
        await init();
      } else { Toast.error(res.data.message); }
    } catch (e) { Toast.error('网络错误'); }
  };

  const handleCreateInvite = async () => {
    if (!inviteSharePct || inviteSharePct <= 0 || inviteSharePct >= 100) {
      Toast.error('请设置 1-99 之间的占比');
      return;
    }
    setCreatingInvite(true);
    try {
      const res = await API.post('/api/agent/group/invite', { share_pct_in_group: inviteSharePct });
      if (res.data.success) {
        const token = res.data.data.invite_token;
        const url = `${window.location.origin}/agent/join/${token}`;
        setGeneratedInviteUrl(url);
        Toast.success('邀请链接生成成功');
      } else {
        Toast.error(res.data.message || '创建邀请失败');
      }
    } catch (e) { Toast.error('网络错误'); }
    setCreatingInvite(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => Toast.success('已复制'));
  };

  const handleLeave = async () => {
    try {
      const res = await API.delete('/api/agent/group/leave');
      if (res.data.success) {
        Toast.success('已退出小组');
        setLeaveVisible(false);
        await init();
      } else { Toast.error(res.data.message); }
    } catch (e) { Toast.error('网络错误'); }
  };

  const handleKick = async () => {
    try {
      const res = await API.delete(`/api/agent/group/member/${kickMemberId}`);
      if (res.data.success) {
        Toast.success('已移出小组');
        setKickVisible(false);
        setKickMemberId(null);
        await init();
      } else { Toast.error(res.data.message); }
    } catch (e) { Toast.error('网络错误'); }
  };

  const handleTransfer = async () => {
    if (!transferToId) { Toast.error('请选择要转让的组员'); return; }
    try {
      const res = await API.post('/api/agent/group/transfer', { new_leader_id: transferToId });
      if (res.data.success) {
        Toast.success('已转让组长');
        setTransferVisible(false);
        await init();
      } else { Toast.error(res.data.message); }
    } catch (e) { Toast.error('网络错误'); }
  };

  const handleUpdateShare = async () => {
    try {
      const res = await API.put(`/api/agent/group/member/${editShareMember.user_id}`, {
        share_pct_in_group: editSharePct,
      });
      if (res.data.success) {
        Toast.success('占比已更新');
        setEditShareVisible(false);
        await init();
      } else { Toast.error(res.data.message); }
    } catch (e) { Toast.error('网络错误'); }
  };

  const fmtDiscount = (v) => Math.round(parseFloat(v) * 100);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size='large' /></div>;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>
      <Title heading={3} style={{ marginBottom: 24 }}>
        <IconGift style={{ marginRight: 8 }} />代理中心
      </Title>

      {/* ===== 代理资料 ===== */}
      <Card title='我的代理资料' style={{ marginBottom: 20 }}>
        {!isAgent && (
          <Banner
            type='info'
            description='填写以下资料即可成为代理，享受平台收益分成。姓名、手机号、微信号为必填项。'
            style={{ marginBottom: 16 }}
          />
        )}
        <Form ref={formRef} initValues={profile || {}}>
          <Form.Input field='real_name' label='姓名' placeholder='真实姓名（必填）' />
          <Form.Input field='phone' label='手机号' placeholder='用于联系（必填）' />
          <Form.Input field='wechat_id' label='微信号' placeholder='用于联系（必填）' />
          <Form.Input field='payment_qr_url' label='收款码图片链接' placeholder='https://... （选填，组长可见）' />
        </Form>
        <Button
          theme='solid' type='primary' loading={submitting}
          onClick={handleSubmitProfile} style={{ marginTop: 12 }}
        >
          {isAgent ? '保存修改' : '提交成为代理'}
        </Button>
      </Card>

      {/* ===== 未加入小组 ===== */}
      {isAgent && !groupData && (
        <Card title='推广小组' style={{ marginBottom: 20 }}>
          <Space vertical align='start'>
            <Text type='secondary'>你还没有加入或创建推广小组。创建小组后可生成推广邀请链接，邀请代理加入你的小组共同推广。</Text>
            <Button icon={<IconPlus />} theme='solid' onClick={() => setCreateGroupVisible(true)}>
              创建推广小组
            </Button>
          </Space>
        </Card>
      )}

      {/* ===== 小组信息 ===== */}
      {groupData && (
        <Card
          title={
            <Space>
              {groupData.avatar_url
                ? <Avatar src={groupData.avatar_url} size='small' />
                : <IconUserGroup />
              }
              <span>{groupData.group_name}</span>
              <Tag color={groupData.my_role === 'leader' ? 'orange' : 'blue'} size='small'>
                {groupData.my_role === 'leader' ? '组长' : '组员'}
              </Tag>
            </Space>
          }
          style={{ marginBottom: 20 }}
          extra={
            groupData.my_role === 'leader' && (
              <Button size='small' icon={<IconSetting />} onClick={() => setEditGroupVisible(true)}>
                编辑小组
              </Button>
            )
          }
        >
          {/* 头像 + 口号 */}
          {(groupData.avatar_url || groupData.slogan) && (
            <Space style={{ marginBottom: 16, alignItems: 'flex-start' }}>
              {groupData.avatar_url && (
                <Avatar src={groupData.avatar_url} size='extra-large' shape='square' />
              )}
              {groupData.slogan && (
                <Text type='secondary' style={{ fontSize: 14 }}>{groupData.slogan}</Text>
              )}
            </Space>
          )}

          {/* 折扣标签 */}
          <Space style={{ marginBottom: 16 }}>
            <Tag color='green'>默认折扣 {fmtDiscount(groupData.default_discount)}折</Tag>
            <Tag color='cyan'>推荐折扣 {fmtDiscount(groupData.recommend_discount)}折</Tag>
          </Space>

          {/* 分润占比说明 */}
          <Banner
            type='info'
            description={
              groupData.my_role === 'leader'
                ? `本组总收益分成：平台拨付 ${groupData.current_share_pct}% 给本小组，剩余归平台。`
                : `你在本组的占比：${groupData.my_share_pct_in_group}%（即本组分成的 ${groupData.my_share_pct_in_group}% 归你）`
            }
            style={{ marginBottom: 16 }}
          />

          {/* 推广镜像站链接（组长+组员都可见） */}
          <div style={{ background: '#f9f9f9', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>推广专属链接</Text>
            <Space>
              <Text code style={{ fontSize: 13 }}>
                {window.location.origin}/g/{groupData.group_code}
              </Text>
              <Button
                size='small' icon={<IconCopy />}
                onClick={() => copyToClipboard(`${window.location.origin}/g/${groupData.group_code}`)}
              >复制</Button>
            </Space>
            <Text type='tertiary' style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
              通过此链接注册的用户将归入本小组，享受本组专属折扣。
            </Text>
          </div>

          {/* 组长：生成邀请链接按钮 */}
          {groupData.my_role === 'leader' && (
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<IconLink />}
                theme='light' type='primary'
                onClick={() => { setInviteVisible(true); setGeneratedInviteUrl(''); }}
              >
                生成组员邀请链接
              </Button>
            </div>
          )}

          {/* 组长：查看组员列表 */}
          {groupData.my_role === 'leader' && (
            <div style={{ marginBottom: 16 }}>
              <Divider />
              <Title heading={6} style={{ marginBottom: 8 }}>
                组员列表 {membersProfiles.length > 0 && <Tag color='blue' size='small'>{membersProfiles.length}人</Tag>}
              </Title>
              {membersProfiles.length === 0 ? (
                <Text type='secondary'>暂无组员，生成邀请链接并发给代理即可邀请加入。</Text>
              ) : (
                <List
                  dataSource={membersProfiles}
                  renderItem={(m) => (
                    <List.Item
                      key={m.user_id}
                      main={
                        <Space style={{ alignItems: 'flex-start', gap: 10 }}>
                          <Avatar size='default'>
                            {(m.real_name || '?').charAt(0)}
                          </Avatar>
                          <Space vertical align='start' style={{ gap: 2 }}>
                            <Text strong>{m.real_name || '未填写姓名'}</Text>
                            <Text type='secondary' style={{ fontSize: 13 }}>
                              📱 {m.phone || '未填写'} &nbsp; 💬 {m.wechat_id || '未填写'}
                            </Text>
                            <Text type='secondary' style={{ fontSize: 13 }}>
                              在组占比：<Text strong>{m.share_pct_in_group}%</Text>
                            </Text>
                            {m.payment_qr_url && (
                              <Button
                                size='small' theme='borderless' icon={<IconQrCode />}
                                onClick={() => window.open(m.payment_qr_url, '_blank')}
                              >查看收款码</Button>
                            )}
                          </Space>
                        </Space>
                      }
                      extra={
                        <Space vertical style={{ gap: 4 }}>
                          <Button
                            size='small' theme='borderless'
                            onClick={() => { setEditShareMember(m); setEditSharePct(m.share_pct_in_group); setEditShareVisible(true); }}
                          >改占比</Button>
                          <Button
                            size='small' type='danger' theme='borderless'
                            onClick={() => { setKickMemberId(m.user_id); setKickVisible(true); }}
                          >踢出</Button>
                        </Space>
                      }
                    />
                  )}
                />
              )}
            </div>
          )}

          {/* 组员：查看组长联系方式 */}
          {groupData.my_role === 'member' && leaderProfile && (
            <div style={{ marginBottom: 16 }}>
              <Divider />
              <Title heading={6} style={{ marginBottom: 8 }}>组长联系方式</Title>
              <Space style={{ background: '#f9f9f9', borderRadius: 8, padding: '12px 16px', alignItems: 'flex-start' }}>
                <Avatar size='large'>
                  {(leaderProfile.real_name || '组').charAt(0)}
                </Avatar>
                <Space vertical align='start' style={{ gap: 4 }}>
                  <Text strong>{leaderProfile.real_name || '未填写'}</Text>
                  <Text type='secondary'>
                    <IconPhone style={{ marginRight: 4 }} />{leaderProfile.phone || '未填写'}
                  </Text>
                  <Text type='secondary'>
                    微信：{leaderProfile.wechat_id || '未填写'}
                  </Text>
                </Space>
              </Space>
            </div>
          )}

          {/* 组长寄语 */}
          {groupData.message_to_members && (
            <Banner
              type='warning'
              description={`组长寄语：${groupData.message_to_members}`}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 退出/转让按钮 */}
          <Divider />
          {groupData.my_role === 'member' && (
            <Button type='danger' theme='borderless' onClick={() => setLeaveVisible(true)}>退出小组</Button>
          )}
          {groupData.my_role === 'leader' && (
            <Button type='danger' theme='borderless' onClick={() => setTransferVisible(true)}>
              转让组长并退出
            </Button>
          )}
        </Card>
      )}

      {/* ===== 创建小组 Modal ===== */}
      <Modal
        title='创建推广小组'
        visible={createGroupVisible}
        onCancel={() => setCreateGroupVisible(false)}
        onOk={handleCreateGroup}
        okText='创建'
      >
        <Form ref={groupFormRef}>
          <Form.Input field='group_name' label='小组名称' placeholder='必填' />
          <Form.Input field='slogan' label='口号/简介' placeholder='选填，展示在推广页' />
          <Form.Input field='message_to_members' label='给组员的话' placeholder='选填，仅组员可见' />
          <Form.Input field='avatar_url' label='小组头像链接' placeholder='https://... （选填）' />
          <Form.InputNumber field='default_discount' label='默认折扣（0.95 = 95折）' initValue={0.95} min={0.1} max={1} step={0.01} />
          <Form.InputNumber field='recommend_discount' label='推荐折扣' initValue={0.95} min={0.1} max={1} step={0.01} />
        </Form>
      </Modal>

      {/* ===== 编辑小组 Modal ===== */}
      <Modal
        title='编辑小组信息'
        visible={editGroupVisible}
        onCancel={() => setEditGroupVisible(false)}
        onOk={handleUpdateGroup}
        okText='保存'
      >
        <Form ref={editGroupFormRef} initValues={groupData || {}}>
          <Form.Input field='group_name' label='小组名称' />
          <Form.Input field='slogan' label='口号/简介' />
          <Form.Input field='message_to_members' label='给组员的话' />
          <Form.Input field='avatar_url' label='小组头像链接' />
          <Form.InputNumber field='default_discount' label='默认折扣' min={0.1} max={1} step={0.01} />
          <Form.InputNumber field='recommend_discount' label='推荐折扣' min={0.1} max={1} step={0.01} />
        </Form>
      </Modal>

      {/* ===== 生成邀请链接 Modal ===== */}
      <Modal
        title='生成组员邀请链接'
        visible={inviteVisible}
        onCancel={() => setInviteVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setInviteVisible(false)}>关闭</Button>
            <Button theme='solid' loading={creatingInvite} onClick={handleCreateInvite}>
              生成链接
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text>为新组员设置在组内的分润占比（1-99）：</Text>
          <div style={{ marginTop: 8 }}>
            <InputNumber
              value={inviteSharePct}
              onChange={setInviteSharePct}
              min={1} max={99} style={{ width: 120 }}
              suffix='%'
            />
          </div>
          <Banner
            type='info'
            description={`该组员将看到自己在组内占 ${inviteSharePct}%，即本组总分成的 ${inviteSharePct}% 归该组员，其余归组长。`}
            style={{ marginTop: 12 }}
          />
        </div>
        {generatedInviteUrl && (
          <div style={{ background: '#f0f9eb', borderRadius: 8, padding: '12px 16px' }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>✅ 邀请链接已生成：</Text>
            <Space>
              <Text code style={{ fontSize: 12, wordBreak: 'break-all' }}>{generatedInviteUrl}</Text>
              <Button size='small' icon={<IconCopy />} onClick={() => copyToClipboard(generatedInviteUrl)}>复制</Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* ===== 踢人 Modal ===== */}
      <Modal
        title='移出组员'
        visible={kickVisible}
        onCancel={() => { setKickVisible(false); setKickMemberId(null); }}
        onOk={handleKick}
        okText='确认移出'
        okButtonProps={{ type: 'danger' }}
      >
        <Text>确定要将该组员移出小组吗？</Text>
      </Modal>

      {/* ===== 退出小组 Modal ===== */}
      <Modal
        title='退出小组'
        visible={leaveVisible}
        onCancel={() => setLeaveVisible(false)}
        onOk={handleLeave}
        okText='确认退出'
        okButtonProps={{ type: 'danger' }}
      >
        <Text>确定要退出当前小组吗？退出后推广记录仍然保留。</Text>
      </Modal>

      {/* ===== 转让组长 Modal ===== */}
      <Modal
        title='转让组长'
        visible={transferVisible}
        onCancel={() => setTransferVisible(false)}
        onOk={handleTransfer}
        okText='确认转让'
      >
        <Text style={{ display: 'block', marginBottom: 12 }}>选择要接任组长的组员：</Text>
        {membersProfiles.length === 0 ? (
          <Text type='secondary'>暂无组员可转让，请先邀请组员加入。</Text>
        ) : (
          membersProfiles.map((m) => (
            <div
              key={m.user_id}
              onClick={() => setTransferToId(m.user_id)}
              style={{
                padding: '10px 14px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${transferToId === m.user_id ? '#0078d4' : '#e0e0e0'}`,
                background: transferToId === m.user_id ? '#e8f0fe' : '#fafafa',
              }}
            >
              <Text strong>{m.real_name || '未填写姓名'}</Text>
              <Text type='secondary' style={{ marginLeft: 8 }}>微信：{m.wechat_id || '未填写'}</Text>
            </div>
          ))
        )}
      </Modal>

      {/* ===== 修改占比 Modal ===== */}
      <Modal
        title='修改组员占比'
        visible={editShareVisible}
        onCancel={() => setEditShareVisible(false)}
        onOk={handleUpdateShare}
        okText='保存'
      >
        <Text style={{ display: 'block', marginBottom: 12 }}>
          修改 {editShareMember?.real_name || '该组员'} 在组内的分润占比：
        </Text>
        <InputNumber
          value={editSharePct}
          onChange={setEditSharePct}
          min={1} max={99} style={{ width: 120 }}
          suffix='%'
        />
      </Modal>
    </div>
  );
};

export default Agent;
