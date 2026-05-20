import React, { useEffect, useState } from 'react';
  import {
    Card,
    Form,
    Button,
    Toast,
    Typography,
    Space,
    Spin,
    Tag,
    Banner,
    Modal,
    InputNumber,
    Divider,
    List,
    Avatar,
  } from '@douyinfe/semi-ui';
  import { IconUser, IconPhone, IconLink, IconGift, IconCopy, IconUserGroup, IconPlus } from '@douyinfe/semi-icons';
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
    const [inviteSharePct, setInviteSharePct] = useState(50);
    const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
    const formRef = React.createRef();
    const groupFormRef = React.createRef();
    const editGroupFormRef = React.createRef();

    useEffect(() => {
      init();
    }, []);

    const init = async () => {
      setLoading(true);
      try {
        const res = await API.get('/api/agent/profile');
        if (res.data.success) {
          setProfile(res.data.data);
          setIsAgent(true);
          const gRes = await API.get('/api/agent/group');
          if (gRes.data.success) {
            setGroupData(gRes.data.data);
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
      } catch (e) {
        Toast.error('网络错误');
      }
      setSubmitting(false);
    };

    const handleCreateGroup = async () => {
      const values = groupFormRef.current.formApi.getValues();
      if (!values.group_name) {
        Toast.error('请填写小组名称');
        return;
      }
      try {
        const res = await API.post('/api/agent/group', {
          group_name: values.group_name,
          slogan: values.slogan || '',
          message_to_members: values.message_to_members || '',
          avatar_url: values.avatar_url || '',
          default_discount: values.default_discount || 0.95,
          recommend_discount: values.recommend_discount || 0.95,
        });
        if (res.data.success) {
          Toast.success('小组创建成功！');
          setCreateGroupVisible(false);
          const gRes = await API.get('/api/agent/group');
          if (gRes.data.success) setGroupData(gRes.data.data);
        } else {
          Toast.error(res.data.message);
        }
      } catch (e) {
        Toast.error('网络错误');
      }
    };

    const handleUpdateGroup = async () => {
      const values = editGroupFormRef.current.formApi.getValues();
      try {
        const res = await API.put('/api/agent/group', values);
        if (res.data.success) {
          Toast.success('更新成功');
          setEditGroupVisible(false);
          const gRes = await API.get('/api/agent/group');
          if (gRes.data.success) setGroupData(gRes.data.data);
        } else {
          Toast.error(res.data.message);
        }
      } catch (e) {
        Toast.error('网络错误');
      }
    };

    const handleCreateInvite = async () => {
      try {
        const res = await API.post('/api/agent/group/invite', {
          share_pct_in_group: inviteSharePct,
        });
        if (res.data.success) {
          const url = `${window.location.origin}/agent/invite/${res.data.data.invite_token}`;
          setGeneratedInviteUrl(url);
        } else {
          Toast.error(res.data.message);
        }
      } catch (e) {
        Toast.error('网络错误');
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => Toast.success('已复制到剪贴板'));
    };

    const handleUpdateMember = async (memberId, newPct) => {
      try {
        const res = await API.put(`/api/agent/group/member/${memberId}`, {
          share_pct_in_group: newPct,
        });
        if (res.data.success) {
          Toast.success('已更新');
          const gRes = await API.get('/api/agent/group');
          if (gRes.data.success) setGroupData(gRes.data.data);
        } else {
          Toast.error(res.data.message);
        }
      } catch (e) {
        Toast.error('网络错误');
      }
    };

    if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spin size='large' /></div>;
    }

    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 16px 40px' }}>
        {/* 引导卡片 */}
        <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'
   }}>
          <Space vertical align='start' style={{ width: '100%' }}>
            <Space align='center'>
              <IconGift size='extra-large' style={{ color: '#fff' }} />
              <Title heading={2} style={{ margin: 0, color: '#fff' }}>成为代理，开启赚钱之路</Title>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 15, lineHeight: 1.8
  }}>加入代理计划，你将获得：</Text>
            <Space vertical align='start' style={{ marginTop: 8 }}>
              <Text style={{ color: '#fff' }}>💰 <b>专属推广链接</b> · 默认拿 25% 分润，进入周榜前 5 可永久
  +10%，最高可叠加至 75%</Text>
              <Text style={{ color: '#fff' }}>🎨 <b>独立镜像站</b> · 自定义折扣力度，让利换销量</Text>
              <Text style={{ color: '#fff' }}>👥 <b>组队推广</b> · 邀请朋友加入小组，自由分配收益</Text>
              <Text style={{ color: '#fff' }}>🏆 <b>排行榜竞争</b> · 周榜/日榜公开，前 5 名享额外加成</Text>
            </Space>
          </Space>
        </Card>

        {/* 代理资料 */}
        <Card style={{ marginBottom: 20 }}>
          <Space vertical align='start' style={{ width: '100%' }}>
            <Space align='center'>
              <IconUser size='extra-large' />
              <Title heading={3} style={{ margin: 0 }}>{isAgent ? '我的代理资料' : '立即成为代理'}</Title>
              {isAgent && <Tag color='green' size='large'>已成为代理</Tag>}
            </Space>
            {!isAgent && <Banner type='info' icon={null} description='填写以下信息即可立即成为代理，无需审核。' style={{
   marginTop: 8 }} />}
            <Form ref={formRef} layout='vertical' style={{ width: '100%', marginTop: 16 }} initValues={profile || {}}>
              <Form.Input field='real_name' label='真实姓名' placeholder='请输入您的真实姓名' prefix={<IconUser />}
  rules={[{ required: true }]} />
              <Form.Input field='phone' label='手机号' placeholder='请输入手机号' prefix={<IconPhone />} rules={[{
  required: true }]} />
              <Form.Input field='wechat_id' label='微信号' placeholder='用于接收收益通知' prefix={<IconLink />}
  rules={[{ required: true }]} />
              <Form.Input field='wechat_qr_url' label='微信收款码图片链接（选填）' placeholder='方便我们直接给你打款' />
              <Form.Input field='alipay_qr_url' label='支付宝收款码图片链接（选填）' placeholder='方便我们直接给你打款'
  />
              <Form.TextArea field='remark' label='备注（选填）' placeholder='其他想说明的信息' rows={3} />
            </Form>
            <Button theme='solid' type='primary' size='large' block loading={submitting} onClick={handleSubmitProfile}
  style={{ marginTop: 8 }}>
              {isAgent ? '更新资料' : '🚀 立即成为代理'}
            </Button>
          </Space>
        </Card>

        {/* 我的小组 */}
        {isAgent && (
          <Card>
            <Space vertical align='start' style={{ width: '100%' }}>
              <Space align='center'>
                <IconUserGroup size='extra-large' />
                <Title heading={3} style={{ margin: 0 }}>我的小组</Title>
              </Space>

              {!groupData && (
                <>
                  <Text
  type='tertiary'>你还没有加入任何小组。创建自己的小组成为组长，或通过组长发来的邀请链接加入小组。</Text>
                  <Button theme='solid' type='primary' icon={<IconPlus />} onClick={() => setCreateGroupVisible(true)}
  style={{ marginTop: 12 }}>
                    创建我的小组
                  </Button>
                </>
              )}

              {groupData && (
                <>
                  <Space align='center' style={{ marginTop: 8 }}>
                    {groupData.group.avatar_url && <Avatar src={groupData.group.avatar_url} size='large' />}
                    <div>
                      <Title heading={4} style={{ margin: 0 }}>{groupData.group.group_name}</Title>
                      <Text type='tertiary'>{groupData.group.slogan || '暂无宣传词'}</Text>
                    </div>
                    {groupData.is_leader ? <Tag color='red'>组长</Tag> : <Tag color='blue'>组员</Tag>}
                  </Space>

                  <Divider />

                  {groupData.is_leader ? (
                    <>
                      <Text>
                        <b>专属镜像站链接：</b>
                        <Text link copyable={{ content: `${window.location.origin}/g/${groupData.group.group_code}` }}>
                          {window.location.origin}/g/{groupData.group.group_code}
                        </Text>
                      </Text>
                      <Text>当前自助充值折扣：<b>{(groupData.group.default_discount * 100).toFixed(0)}%</b></Text>
                      <Text>当前小组分润比例：<b>{groupData.group.current_share_pct}%</b>（全平台利润中）</Text>

                      <Space style={{ marginTop: 12 }}>
                        <Button onClick={() => setEditGroupVisible(true)}>编辑小组设置</Button>
                        <Button theme='solid' type='primary' onClick={() => { setInviteVisible(true);
  setGeneratedInviteUrl(''); }}>生成邀请链接</Button>
                      </Space>

                      <Divider />
                      <Title heading={5}>组员列表</Title>
                      <List
                        dataSource={groupData.members}
                        renderItem={(m) => (
                          <List.Item
                            main={
                              <div>
                                <Text strong>{m.role === 'leader' ? '👑 组长（你）' : `组员 #${m.user_id ||
  '待加入'}`}</Text>
                                <div><Text type='tertiary'>组内分润占比：{m.share_pct_in_group}%</Text></div>
                                {m.status === 0 && <Tag color='orange'>邀请待接受</Tag>}
                              </div>
                            }
                            extra={
                              m.role === 'member' && m.status === 1 && (
                                <InputNumber
                                  min={0}
                                  max={100}
                                  step={5}
                                  defaultValue={m.share_pct_in_group}
                                  suffix='%'
                                  onBlur={(e) => {
                                    const v = parseFloat(e.target.value);
                                    if (!isNaN(v) && v !== m.share_pct_in_group) handleUpdateMember(m.id, v);
                                  }}
                                />
                              )
                            }
                          />
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <Banner type='success' icon={null}
  description={`你在本组的分润占比：${groupData.me.share_pct_in_group}%`} />
                      {groupData.group.message_to_members && (
                        <Card style={{ marginTop: 12, background: '#f5f5f5' }}>
                          <Text type='tertiary'>组长的话：</Text>
                          <div>{groupData.group.message_to_members}</div>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}
            </Space>
          </Card>
        )}

        {/* 创建小组弹窗 */}
        <Modal title='创建我的小组' visible={createGroupVisible} onCancel={() => setCreateGroupVisible(false)}
  onOk={handleCreateGroup} okText='创建' cancelText='取消' size='medium'>
          <Form ref={groupFormRef} layout='vertical'>
            <Form.Input field='group_name' label='小组名称' placeholder='例如：极客代理小队' rules={[{ required: true
  }]} />
            <Form.Input field='slogan' label='宣传词' placeholder='展示在排行榜的口号' />
            <Form.Input field='avatar_url' label='小组头像图片链接' placeholder='https://...' />
            <Form.InputNumber field='default_discount' label='自助充值折扣（0.9-1.0，例如 0.9 表示 9 折）' min={0.9}
  max={1.0} step={0.01} initValue={0.95} />
            <Form.InputNumber field='recommend_discount' label='推荐充值折扣（0.9-1.0）' min={0.9} max={1.0} step={0.01}
   initValue={0.95} />
            <Form.TextArea field='message_to_members' label='给组员的话（选填）' rows={3} />
          </Form>
        </Modal>

        {/* 编辑小组弹窗 */}
        <Modal title='编辑小组设置' visible={editGroupVisible} onCancel={() => setEditGroupVisible(false)}
  onOk={handleUpdateGroup} okText='保存' cancelText='取消' size='medium'>
          <Form ref={editGroupFormRef} layout='vertical' initValues={groupData?.group || {}}>
            <Form.Input field='group_name' label='小组名称' />
            <Form.Input field='slogan' label='宣传词' />
            <Form.Input field='avatar_url' label='小组头像图片链接' />
            <Form.InputNumber field='default_discount' label='自助充值折扣（0.9-1.0）' min={0.9} max={1.0} step={0.01}
  />
            <Form.InputNumber field='recommend_discount' label='推荐充值折扣（0.9-1.0）' min={0.9} max={1.0} step={0.01}
   />
            <Form.TextArea field='message_to_members' label='给组员的话' rows={3} />
          </Form>
        </Modal>

        {/* 生成邀请弹窗 */}
        <Modal title='生成组员邀请链接' visible={inviteVisible} onCancel={() => { setInviteVisible(false);
  setGeneratedInviteUrl(''); }} footer={null} size='medium'>
          {!generatedInviteUrl ? (
            <Space vertical align='start' style={{ width: '100%' }}>
              <Text>设置该组员在本组的分润占比（0-100%）。</Text>
              <Text type='tertiary' style={{ fontSize: 12 }}>
                提示：组员看到的就是这个数字。你可以给不同组员设不同的比例。所有组员的占比加起来不能超过 100%。
              </Text>
              <InputNumber min={1} max={99} step={5} value={inviteSharePct} suffix='%' onChange={setInviteSharePct}
  style={{ width: 200 }} />
              <Button theme='solid' type='primary' onClick={handleCreateInvite}>生成邀请链接</Button>
            </Space>
          ) : (
            <Space vertical align='start' style={{ width: '100%' }}>
              <Banner type='success' icon={null} description='邀请链接已生成！把它发给你想邀请的朋友。' />
              <Text strong>邀请链接：</Text>
              <Text code style={{ wordBreak: 'break-all' }}>{generatedInviteUrl}</Text>
              <Button theme='solid' icon={<IconCopy />} onClick={() =>
  copyToClipboard(generatedInviteUrl)}>复制链接</Button>
            </Space>
          )}
        </Modal>
      </div>
    );
  };

  export default Agent;