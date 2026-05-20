import React, { useEffect, useState } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { Card, Button, Toast, Typography, Space, Spin, Tag, Banner, Avatar } from '@douyinfe/semi-ui';
  import { IconUserGroup } from '@douyinfe/semi-icons';
  import { API } from '../../helpers';

  const { Title, Text } = Typography;

  const Invite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
      loadInfo();
    }, [token]);

    const loadInfo = async () => {
      try {
        const res = await API.get(`/api/agent/invite/${token}`);
        if (res.data.success) {
          setInfo(res.data.data);
        } else {
          setError(res.data.message || '邀请链接无效');
        }
      } catch (e) {
        setError('网络错误');
      }
      setLoading(false);
    };

    const handleAccept = async () => {
      setAccepting(true);
      try {
        const res = await API.post(`/api/agent/invite/${token}/accept`);
        if (res.data.success) {
          Toast.success('成功加入小组！');
          setTimeout(() => navigate('/agent'), 1000);
        } else {
          Toast.error(res.data.message || '加入失败');
        }
      } catch (e) {
        Toast.error('网络错误');
      }
      setAccepting(false);
    };

    if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}><Spin size='large' /></div>;
    }

    if (error) {
      return (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '120px 16px 40px' }}>
          <Card>
            <Banner type='danger' icon={null} description={error} />
          </Card>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 40px' }}>
        <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border:
  'none', marginBottom: 20 }}>
          <Space vertical style={{ width: '100%' }}>
            <IconUserGroup size='extra-large' style={{ color: '#fff' }} />
            <Title heading={2} style={{ color: '#fff', margin: 0 }}>邀请你加入代理小组</Title>
          </Space>
        </Card>

        <Card>
          <Space vertical align='center' style={{ width: '100%' }}>
            {info.avatar_url && <Avatar src={info.avatar_url} size='extra-large' />}
            <Title heading={3} style={{ margin: 0 }}>{info.group_name}</Title>
            {info.slogan && <Text type='tertiary'>{info.slogan}</Text>}

            <Tag size='large' color='red' style={{ fontSize: 16, padding: '8px 20px', marginTop: 12 }}>
              你将获得：{info.share_pct_in_group}% 分润占比
            </Tag>

            {info.message_to_members && (
              <Card style={{ background: '#f5f5f5', width: '100%', marginTop: 12 }}>
                <Text type='tertiary'>组长寄语：</Text>
                <div style={{ marginTop: 8 }}>{info.message_to_members}</div>
              </Card>
            )}

            <Banner
            <Banner
              type='info'
              icon={null}
              description='接受邀请前，需要先完成代理资料填写。'
              style={{ width: '100%', marginTop: 12 }}
            />

            <Space style={{ marginTop: 16 }}>
              <Button onClick={() => navigate('/')}>暂不加入</Button>
              <Button theme='solid' type='primary' size='large' loading={accepting} onClick={handleAccept}>
                ✅ 接受邀请并加入
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  };

  export default Invite;