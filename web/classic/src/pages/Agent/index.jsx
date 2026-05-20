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
  } from '@douyinfe/semi-ui';
  import { IconUser, IconPhone, IconLink } from '@douyinfe/semi-icons';
  import { API } from '../../helpers';

  const { Title, Text } = Typography;

  const Agent = () => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
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
          setIsEdit(true);
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
          Toast.success('保存成功！');
          setProfile(values);
          setIsEdit(true);
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
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
        <Card>
          <Space vertical align='start' style={{ width: '100%' }}>
            <Space align='center'>
              <IconUser size='extra-large' />
              <Title heading={3} style={{ margin: 0 }}>
                我想成为代理
              </Title>
              {isEdit && <Tag color='green'>已申请</Tag>}
            </Space>

            <Text type='tertiary'>
              填写以下信息完成代理申请。申请成功后，您将获得专属推广链接和小组管理权限。
            </Text>

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
                placeholder='请输入手机号'
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
                label='微信收款码图片链接（可选）'
                placeholder='请输入图片 URL'
              />
              <Form.Input
                field='alipay_qr_url'
                label='支付宝收款码图片链接（可选）'
                placeholder='请输入图片 URL'
              />
              <Form.TextArea
                field='remark'
                label='备注（可选）'
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
            >
              {isEdit ? '更新申请信息' : '提交申请'}
            </Button>

            {isEdit && (
              <Text type='tertiary' style={{ fontSize: 12 }}>
                您已完成代理申请。小组创建和推广链接功能即将开放。
              </Text>
            )}
          </Space>
        </Card>
      </div>
    );
  };

  export default Agent;