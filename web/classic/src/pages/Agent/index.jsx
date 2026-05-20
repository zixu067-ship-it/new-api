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
  } from '@douyinfe/semi-ui';
  import { IconUser, IconPhone, IconLink, IconGift } from '@douyinfe/semi-icons';
  import { API } from '../../helpers';

  const { Title, Text, Paragraph } = Typography;

  const Agent = () => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState(null);
    const [isAgent, setIsAgent] = useState(false);
    const formRef = React.createRef();

    useEffect(() => {
      loadProfile();
    }, []);

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get('/api/agent/profile');
        if (res.data.success) {
          setProfile(res.data.data);
          setIsAgent(true);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async () => {
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
        Toast.error('网络错误，请重试');
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Spin size='large' />
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 16px 40px' }}>
        {/* 顶部引导卡片 */}
        <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'
   }}>
          <Space vertical align='start' style={{ width: '100%' }}>
            <Space align='center'>
              <IconGift size='extra-large' style={{ color: '#fff' }} />
              <Title heading={2} style={{ margin: 0, color: '#fff' }}>
                成为代理，开启赚钱之路
              </Title>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 15, lineHeight: 1.8 }}>
              加入我们的代理计划，你将获得：
            </Text>
            <Space vertical align='start' style={{ marginTop: 8 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                💰 <b>专属推广链接</b> · 用户充值你拿分润，最高可达 35%
              </Text>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                🎨 <b>独立镜像站</b> · 自定义折扣力度，让利换销量
              </Text>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                👥 <b>组队推广</b> · 邀请朋友加入小组，自由分配收益
              </Text>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                🏆 <b>排行榜竞争</b> · 周榜/日榜公开，前 5 名享额外加成
              </Text>
            </Space>
          </Space>
        </Card>

        {/* 申请表单卡片 */}
        <Card>
          <Space vertical align='start' style={{ width: '100%' }}>
            <Space align='center'>
              <IconUser size='extra-large' />
              <Title heading={3} style={{ margin: 0 }}>
                {isAgent ? '我的代理资料' : '立即成为代理'}
              </Title>
              {isAgent && <Tag color='green' size='large'>已成为代理</Tag>}
            </Space>

            {!isAgent && (
              <Banner
                type='info'
                icon={null}
                description='填写以下信息即可立即成为代理，无需审核。资料用于结算和联系，我们会严格保密。'
                style={{ marginTop: 8 }}
              />
            )}

            {isAgent && (
              <Text type='success' style={{ marginTop: 8 }}>
                ✅ 你已成为代理，可以随时更新下方资料。小组创建和推广链接功能即将开放。
              </Text>
            )}

            <Form
              ref={formRef}
              layout='vertical'
              style={{ width: '100%', marginTop: 16 }}
              initValues={profile || {}}
            >
              <Form.Input
                field='real_name'
                label='真实姓名'
                placeholder='请输入您的真实姓名'
                prefix={<IconUser />}
                rules={[{ required: true, message: '请输入姓名' }]}
              />
              <Form.Input
                field='phone'
                label='手机号'
                placeholder='请输入手机号（用于紧急联系）'
                prefix={<IconPhone />}
                rules={[{ required: true, message: '请输入手机号' }]}
              />
              <Form.Input
                field='wechat_id'
                label='微信号'
                placeholder='请输入微信号（用于接收收益通知）'
                prefix={<IconLink />}
                rules={[{ required: true, message: '请输入微信号' }]}
              />
              <Form.Input
                field='wechat_qr_url'
                label='微信收款码图片链接（选填）'
                placeholder='方便我们直接给你打款'
              />
              <Form.Input
                field='alipay_qr_url'
                label='支付宝收款码图片链接（选填）'
                placeholder='方便我们直接给你打款'
              />
              <Form.TextArea
                field='remark'
                label='备注（选填）'
                placeholder='其他想说明的信息'
                rows={3}
              />
            </Form>

            <Button
              theme='solid'
              type='primary'
              size='large'
              block
              loading={submitting}
              onClick={handleSubmit}
              style={{ marginTop: 8 }}
            >
              {isAgent ? '更新资料' : '🚀 立即成为代理'}
            </Button>
          </Space>
        </Card>
      </div>
    );
  };

  export default Agent;