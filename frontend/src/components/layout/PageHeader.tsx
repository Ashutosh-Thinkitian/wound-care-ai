import { Flex, Heading, Text, Separator } from '@radix-ui/themes'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <>
      <Flex align="center" justify="between" mb="4">
        <div>
          <Heading size="6" mb="1">
            {title}
          </Heading>
          {subtitle && (
            <Text size="2" color="gray">
              {subtitle}
            </Text>
          )}
        </div>
        {action && <div>{action}</div>}
      </Flex>
      <Separator size="4" mb="5" />
    </>
  )
}
