import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Typography, Avatar, Space, Button, Modal, Spin, Empty, Toast,
  InputNumber, Popconfirm, Image,
} from '@douyinfe/semi-ui';
import { API, copy as copyText, showError } from '../../helpers';
import SiderBar from '../../components/layout/SiderBar';

const { Title, Text, Paragraph } = Typography;

const AgentAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [editPct, setEditPct] = useState(null); // {group, value}
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await API.get('/api/agent-admin/groups');
      if (r.data.success) {
        const list = (r.data.data || []).slice();
        list.sort((a, b) => (b.weekly_topup_sum || 0) - (a.weekly_topup_sum || 0));
        setRows(list);
      }
      else showError(r.data.message || '加载失败');
    } catch (e) { showError(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submitPct = async () => {
    if (!editPct) return;
    if (editPct.value < 25 || editPct.value > 70) {
      Toast.warning('比例必须在 25 ~ 70 之间'); return;
    }
    setSaving(true);
    try {
      const r = await API.put(`/api/agent-admin/groups/${editPct.group.id}/share-pct`, { share_pct: Number(editPct.value) });
      if (r.data.success) {
        Toast.success('已更新');
        setEditPct(null);
        load();
      } else showError(r.data.message || '更新失败');
    } catch (e) { showError(e.message); }
    setSaving(false);
  };

  const dissolve = async (g) => {
    try {
      const r = await API.delete(`/api/agent-admin/groups/${g.id}`);
      if (r.data.success) {
        Toast.success('已解散');
        load();
      } else showError(r.data.message || '解散失败');
    } catch (e) { showError(e.message); }
  };

  const columns = [
    { title: '小组', dataIndex: 'group', width: 240, render: (g, r, idx) => (
        <Space>
          <Tag color={idx === 0 ? 'amber' : idx === 1 ? 'grey' : idx === 2 ? 'orange' : 'white'} style={{ minWidth: 32, textAlign: 'center' }}>#{idx + 1}</Tag>
          <Avatar src={g.avatar_url} size="small">{g.group_name?.[0] || 'G'}</Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{g.group_name}</div>
            <Text size="small" type="tertiary">码 {g.group_code}</Text>
          </div>
        </Space>
    )},
    { title: '组长', dataIndex: '_', render: (_, r) => {
        const p = r.leader_profile;
        return (
          <Space vertical align="start" spacing={2}>
            <Text strong>{p?.real_name || p?.nickname || r.leader_display_name || r.leader_username || `用户#${r.group.leader_user_id}`}</Text>
            <Text size="small">微信：{p?.wechat_id || p?.wechat || '-'}　电话：{p?.phone || '-'}</Text>
          </Space>
        );
    }},
    { title: '组员/邀请待接受', dataIndex: 'member_count', width: 130, render: (n, r) => (
        <Space>
          <Tag color="blue">{n} 人</Tag>
          {r.pending_invites > 0 && <Tag color="orange">+{r.pending_invites} 待接受</Tag>}
        </Space>
    )},
    { title: '本周累计充值 / 应分红', dataIndex: 'weekly_topup_sum', width: 200, sorter: (a, b) => (a.weekly_topup_sum||0) - (b.weekly_topup_sum||0), render: (v, r) => (
        <Space vertical align="start" spacing={2}>
          <Text strong style={{ color: '#6E3FE7' }}>充值 ¥{Number(v || 0).toFixed(2)}</Text>
          <Text size="small" type="success">应分红 ¥{Number(r.weekly_group_share || 0).toFixed(2)}</Text>
          <Text size="small" type="tertiary">= 充值 × 50% × {Number(r.group?.current_share_pct||0).toFixed(2)}%</Text>
        </Space>
    )},
    { title: '分红', dataIndex: 'group', width: 200, render: (g) => (
        <Space vertical align="start" spacing={2}>
          <Space>
            <Tag color="violet">当前 {Number(g.current_share_pct || 0).toFixed(2)}%</Tag>
            <Button size="small" type="tertiary" onClick={() => setEditPct({ group: g, value: Number(g.current_share_pct || 25) })}>编辑</Button>
          </Space>
          <Text size="small" type="tertiary">基础 {Number(g.base_share_pct || 0).toFixed(2)}%</Text>
        </Space>
    )},
    { title: '折扣', dataIndex: 'group', width: 100, render: (g) => (
        <Text>{Math.round((g.default_discount || 1) * 100) / 10} 折</Text>
    )},
    { title: '操作', dataIndex: '_', width: 280, render: (_, r) => (
        <Space wrap>
          <Button size="small" onClick={() => setDetail(r)}>详情</Button>
          <Button size="small" onClick={() => {
            const url = `${window.location.origin}/m/${r.group.group_code}`;
            copyText(url); Toast.success('已复制镜像链接');
          }}>复制镜像链接</Button>
          <Popconfirm
            title="确认解散此小组？"
            content="此操作不可撤销。所有组员关系会被删除（用户账号保留）。"
            onConfirm={() => dissolve(r.group)}
          >
            <Button size="small" type="danger">解散</Button>
          </Popconfirm>
        </Space>
    )},
  ];

  return (
    <div style={{ display: 'flex' }}>
      <SiderBar />
      <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title heading={3}>👥 小组管理（管理员视角）</Title>
            <Button onClick={load}>刷新</Button>
          </Space>
          <Paragraph type="tertiary">查看所有推广小组、组长联系方式、组员人数、分红设置；可手动调整分红比例（25%~70%）或解散小组。</Paragraph>
          {loading ? <Spin /> : (rows.length === 0 ? <Empty title="暂无小组" /> :
            <Table
              rowKey={(r) => r.group.id}
              columns={columns}
              dataSource={rows}
              pagination={false}
            />
          )}
        </Card>

        <Modal
          title={detail ? `小组详情：${detail.group.group_name}` : ''}
          visible={!!detail}
          onCancel={() => setDetail(null)}
          footer={null}
          width={640}
        >
          {detail && (
            <div>
              <Paragraph><b>邀请码：</b>{detail.group.group_code}</Paragraph>
              <Paragraph><b>宣传语：</b>{detail.group.slogan || '-'}</Paragraph>
              <Paragraph><b>对组员的话：</b>{detail.group.message_to_members || '-'}</Paragraph>
              <Paragraph><b>当前分红比例：</b>{Number(detail.group.current_share_pct).toFixed(2)}%（基础 {Number(detail.group.base_share_pct).toFixed(2)}%）</Paragraph>
              <Paragraph><b>充值折扣：</b>{Math.round((detail.group.default_discount || 1) * 100) / 10} 折</Paragraph>
              <Title heading={5} style={{ marginTop: 16 }}>组长资料</Title>
              <Paragraph><b>用户名 / 显示名：</b>{detail.leader_username || '-'} / {detail.leader_display_name || '-'}</Paragraph>
              <Paragraph><b>真实姓名：</b>{detail.leader_profile?.real_name || '-'}</Paragraph>
              <Paragraph><b>昵称：</b>{detail.leader_profile?.nickname || '-'}</Paragraph>
              <Paragraph><b>电话：</b>{detail.leader_profile?.phone || '-'}</Paragraph>
              <Paragraph><b>微信：</b>{detail.leader_profile?.wechat_id || detail.leader_profile?.wechat || '-'}</Paragraph>
              <Paragraph><b>备注：</b>{detail.leader_profile?.remark || '-'}</Paragraph>
              {detail.leader_profile?.wechat_qr_url && (
                <div style={{ marginTop: 12 }}>
                  <b>微信收款码：</b>
                  <div style={{ marginTop: 8 }}>
                    <Image src={detail.leader_profile.wechat_qr_url} width={200} />
                    <div><Text size="small" type="tertiary">点击图片可放大</Text></div>
                  </div>
                </div>
              )}
              {detail.leader_profile?.alipay_qr_url && (
                <div style={{ marginTop: 12 }}>
                  <b>支付宝收款码：</b>
                  <div style={{ marginTop: 8 }}>
                    <Image src={detail.leader_profile.alipay_qr_url} width={200} />
                    <div><Text size="small" type="tertiary">点击图片可放大</Text></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal
          title={editPct ? `调整分红：${editPct.group.group_name}` : ''}
          visible={!!editPct}
          onOk={submitPct}
          confirmLoading={saving}
          onCancel={() => setEditPct(null)}
          okText="保存"
          cancelText="取消"
        >
          {editPct && (
            <div>
              <Paragraph type="tertiary">范围 25% ~ 70%。当前：{Number(editPct.group.current_share_pct).toFixed(2)}%（基础 {Number(editPct.group.base_share_pct).toFixed(2)}%）</Paragraph>
              <InputNumber
                value={editPct.value}
                min={25}
                max={70}
                step={1}
                precision={2}
                suffix="%"
                style={{ width: 200 }}
                onChange={(v) => setEditPct({ ...editPct, value: v })}
              />
              <Paragraph type="tertiary" style={{ marginTop: 12 }}>对周榜前 5 名小组通常 +10%（最高 70%）</Paragraph>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AgentAdmin;
