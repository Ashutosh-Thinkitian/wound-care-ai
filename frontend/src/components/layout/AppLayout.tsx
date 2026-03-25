import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, Badge, IconButton } from '@radix-ui/themes'
import { HamburgerMenuIcon, DashboardIcon, ReaderIcon, Cross1Icon } from '@radix-ui/react-icons'
import clsx from 'clsx'

interface AppLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Sessions', path: '/sessions', icon: <ReaderIcon /> },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleNav = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const sidebar = (
    <Flex direction="column" justify="between" height="100%">
      <Box>
        {/* Logo */}
        <Flex align="center" gap="2" style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--gray-4)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
            <rect width="56" height="56" rx="14" fill="#185FA5"/>
            <rect x="25" y="10" width="6" height="36" rx="3" fill="#ffffff"/>
            <rect x="12" y="25" width="32" height="6" rx="3" fill="#ffffff"/>
            <circle cx="42" cy="14" r="7" fill="#10b981"/>
            <circle cx="42" cy="14" r="3.5" fill="#ffffff"/>
          </svg>
          <Box>
            <Flex align="center" gap="2">
              <Text weight="bold" size="3" style={{ color: '#0c1a2e', letterSpacing: '-0.3px' }}>WoundCare</Text>
              <Box style={{ background: '#E6F1FB', borderRadius: '4px', padding: '1px 7px' }}>
                <Text size="1" weight="bold" style={{ color: '#185FA5', letterSpacing: '0.5px' }}>AI</Text>
              </Box>
            </Flex>
            <Text size="1" style={{ color: '#5a7a9c', letterSpacing: '0.5px', display: 'block' }}>
              AI-Powered Assessment
            </Text>
          </Box>
        </Flex>

        <Box p="4">
          {/* Nav links */}
          <Flex direction="column" gap="1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'soft' : 'ghost'}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => handleNav(item.path)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </Flex>
        </Box>
      </Box>

      {/* Bottom disclaimer */}
      <Flex direction="column" gap="2" align="start" p="4">
        <Badge color="amber">AI Assisted</Badge>
        <Text size="1" color="gray">
          Always verify with a licensed provider
        </Text>
      </Flex>
    </Flex>
  )

  return (
    <Flex style={{ minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <Box
        data-sidebar
        display={{ initial: 'none', sm: 'block' }}
        position="fixed"
        left="0"
        top="0"
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          borderRight: '1px solid var(--gray-a5)',
          backgroundColor: 'var(--color-background)',
          zIndex: 10,
        }}
      >
        {sidebar}
      </Box>

      {/* Mobile top bar */}
      <Box
        data-topbar
        display={{ initial: 'block', sm: 'none' }}
        position="fixed"
        top="0"
        left="0"
        width="100%"
        p="3"
        style={{
          borderBottom: '1px solid var(--gray-a5)',
          backgroundColor: 'var(--color-background)',
          zIndex: 20,
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <IconButton variant="ghost" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </IconButton>
            <Text size="3" weight="bold" color="blue">
              WoundCare AI
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <Box
          data-mobile-overlay
          display={{ initial: 'block', sm: 'none' }}
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          style={{ zIndex: 15 }}
        >
          <Box
            position="fixed"
            top="0"
            left="0"
            width="100%"
            height="100%"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            onClick={() => setMobileOpen(false)}
          />
          <Box
            position="fixed"
            top="0"
            left="0"
            style={{
              width: 'var(--sidebar-width)',
              height: '100vh',
              backgroundColor: 'var(--color-background)',
              zIndex: 16,
            }}
          >
            {sidebar}
          </Box>
        </Box>
      )}

      {/* Main content */}
      <Box
        data-main-content
        className={clsx('page-enter')}
        ml={{ initial: '0', sm: '0' }}
        pt={{ initial: '7', sm: '0' }}
        style={{
          marginLeft: 'var(--sidebar-width)',
          width: 'calc(100% - var(--sidebar-width))',
          minHeight: '100vh',
        }}
      >
        {/* Override margin on mobile via media query inline won't work, use responsive display */}
        <Box p="5">
          {children}
        </Box>
      </Box>

      {/* Mobile main content override styles */}
      <style>{`
        @media (max-width: 767px) {
          .page-enter {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 56px;
          }
        }
      `}</style>
    </Flex>
  )
}
