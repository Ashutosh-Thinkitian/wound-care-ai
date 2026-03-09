import { useState } from 'react'
import { Box, Flex, Text, IconButton } from '@radix-ui/themes'
import { CopyIcon, CheckIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { QRCodeSVG } from 'qrcode.react'
import type { Session } from '@/types'

interface QRCodeDisplayProps {
  qrUrl: string
  sessionId: string
  status: Session['status']
}

export default function QRCodeDisplay({ qrUrl, sessionId, status }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API not available
    }
  }

  const isScanned = status !== 'pending'

  return (
    <Flex direction="column" align="center" gap="3">
      {/* QR Code with overlay */}
      <Box
        style={{
          position: 'relative',
          padding: 16,
          backgroundColor: 'white',
          borderRadius: 'var(--radius-3)',
          border: '1px solid var(--gray-a4)',
        }}
      >
        <QRCodeSVG value={qrUrl} size={220} level="M" />

        {/* Overlay when scanned */}
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="2"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--radius-3)',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            opacity: isScanned ? 1 : 0,
            pointerEvents: isScanned ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          <CheckCircledIcon width={40} height={40} color="var(--green-9)" />
          <Text size="3" weight="medium" color="green">
            {status === 'image_received' && 'Image Received'}
            {status === 'analyzing' && 'Analyzing...'}
            {status === 'complete' && 'Complete'}
            {status === 'error' && 'Error'}
          </Text>
        </Flex>
      </Box>

      {/* Session ID + copy button */}
      <Flex align="center" gap="2">
        <Text size="1" color="gray">
          Session ID: {sessionId.slice(0, 8)}...
        </Text>
        <IconButton variant="ghost" size="1" onClick={handleCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </IconButton>
      </Flex>
    </Flex>
  )
}
