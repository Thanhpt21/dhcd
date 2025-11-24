'use client';

import { Image, Layout, Menu } from 'antd';
import { 
  BranchesOutlined, 
  DashboardOutlined, 
  FileProtectOutlined, 
  LaptopOutlined, 
  SettingOutlined, 
  SolutionOutlined, 
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  LinkOutlined,
  MailOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined, // Thêm icon cho question
  FileTextOutlined
} from '@ant-design/icons';
import Link from 'next/link';

interface SidebarAdminProps {
  collapsed: boolean;
}

export default function SidebarAdmin({ collapsed }: SidebarAdminProps) {
  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="!bg-white shadow"
      style={{ backgroundColor: '#fff' }}
    >
      <div className=" text-center py-4">
        <Image
          src="https://www.sfdcpoint.com/wp-content/uploads/2019/01/Salesforce-Admin-Interview-questions.png"
          alt="Admin Logo"
          width={collapsed ? 40 : 80}
          preview={false}
        />
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: <Link href="/admin">Dashboard</Link>,
          },        
          {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link href="/admin/users">Tài khoản</Link>,
          },
          {
            key: 'meeting-group',
            icon: <LaptopOutlined />,
            label: 'Quản lý cuộc họp',
            children: [
              { 
                key: 'meetings', 
                icon: <LaptopOutlined />, 
                label: <Link href="/admin/meetings">Danh sách cuộc họp</Link> 
              },
              { 
                key: 'registrations', 
                icon: <CalendarOutlined />, 
                label: <Link href="/admin/registrations">Đăng ký tham dự</Link> 
              },
              { 
                key: 'attendances', 
                icon: <CheckCircleOutlined />, 
                label: <Link href="/admin/attendances">Điểm danh</Link> 
              },
              { 
                key: 'questions', 
                icon: <QuestionCircleOutlined />, 
                label: <Link href="/admin/questions">Quản lý câu hỏi</Link> 
              },
            ],
          },
          {
            key: 'shareholders',
            icon: <TeamOutlined />,
            label: <Link href="/admin/shareholders">Quản lý cổ đông</Link>,
          },
          {
            key: 'proxies',
            icon: <SafetyCertificateOutlined />,
            label: <Link href="/admin/proxies">Quản lý ủy quyền</Link>,
          },
          {
            key: 'verification-links',
            icon: <LinkOutlined />,
            label: <Link href="/admin/verification-links">Link Xác Thực</Link>,
          },
          {
            key: 'role',
            icon: <SettingOutlined />,
            label: <Link href="/admin/role">Vai trò</Link>,
          },
          {
            key: 'permission',
            icon: <FileProtectOutlined />,
            label: <Link href="/admin/permission">Quyền</Link>,
          },
          {
            key: 'promptAI',
            icon: <SolutionOutlined />,
            label: <Link href="/admin/promptAI">Kịch bản AI</Link>,
          },
            // {
            //     key: 'reports',
            //     icon: <FileTextOutlined />,
            //     label: <Link href="/admin/reports">Quản Lý Báo Cáo</Link>,
            //   },
          {
            key: 'sub1',
            icon: <BranchesOutlined />,
            label: 'Báo cáo',
            children: [
               {
                key: 'reports',
                icon: <FileTextOutlined />,
                label: <Link href="/admin/reports">Quản Lý Báo Cáo</Link>,
              },
              {
                key: 'report-templates',
                icon: <FileTextOutlined />,
                label: <Link href="/admin/report-templates">Báo cáo Templates</Link>
              },
            
            ],
          },
           {
            key: 'sub4',
            icon: <BranchesOutlined />,
            label: 'Cấu hình',
            children: [
              { key: 'config', icon: <SettingOutlined />, label: <Link href="/admin/config">Cấu hình</Link> },
              { key: 'meeting-settings', icon: <SettingOutlined />, label: <Link href="/admin/meeting-settings">Cài đặt cuộc họp</Link> },
              { 
                key: 'email-templates', 
                icon: <MailOutlined />, 
                label: <Link href="/admin/email-templates">Email Templates</Link> 
              },
             
            ],
          },
        ]}
      />
    </Layout.Sider>
  );
}