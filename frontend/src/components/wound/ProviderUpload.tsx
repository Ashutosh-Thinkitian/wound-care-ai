import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Flex,
  Box,
  Text,
  Button,
  Callout,
  Spinner,
} from '@radix-ui/themes'
import {
  UploadIcon,
  ArrowRightIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'
import { useImageUpload } from '@/hooks/useImageUpload'
import type { Session } from '@/types'

interface ProviderUploadProps {
  sessionId: string
  status: Session['status']
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProviderUpload({ sessionId, status }: ProviderUploadProps) {
  const {
    selectedFile,
    previewUrl,
    uploadState,
    uploadError,
    selectFile,
    clearFile,
    uploadImage,
  } = useImageUpload(sessionId)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        selectFile(acceptedFiles[0])
      }
    },
    [selectFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: status !== 'pending' || uploadState === 'uploading' || uploadState === 'success',
  })

  const alreadySubmitted = status !== 'pending'

  // SUCCESS state
  if (uploadState === 'success') {
    return (
      <Callout.Root color="green" size="2">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Image submitted successfully! The AI is analyzing the wound.
        </Callout.Text>
      </Callout.Root>
    )
  }

  // PREVIEW / UPLOADING state
  if (uploadState === 'preview' || uploadState === 'uploading') {
    const isUploading = uploadState === 'uploading'

    return (
      <Flex direction="column" gap="4">
        <Box
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-3)',
            overflow: 'hidden',
          }}
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Wound preview"
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                display: 'block',
                borderRadius: 'var(--radius-3)',
                opacity: isUploading ? 0.4 : 1,
                transition: 'opacity 0.3s ease',
              }}
            />
          )}
          {isUploading && (
            <Flex
              align="center"
              justify="center"
              direction="column"
              gap="2"
              style={{ position: 'absolute', inset: 0 }}
            >
              <Spinner size="3" />
              <Text size="2" weight="medium">
                Uploading and starting analysis...
              </Text>
            </Flex>
          )}
        </Box>

        {selectedFile && (
          <Text size="2" color="gray">
            {selectedFile.name} · {formatFileSize(selectedFile.size)}
          </Text>
        )}

        {!isUploading && (
          <Text size="2" color="gray">
            Confirm this image is clear and shows the wound fully
          </Text>
        )}

        <Flex gap="3">
          <Button
            variant="soft"
            color="gray"
            disabled={isUploading}
            onClick={clearFile}
          >
            Choose Different
          </Button>
          <Button
            color="blue"
            disabled={isUploading}
            loading={isUploading}
            onClick={uploadImage}
          >
            Submit for AI Analysis
            <ArrowRightIcon />
          </Button>
        </Flex>
      </Flex>
    )
  }

  // ERROR state
  if (uploadState === 'error') {
    return (
      <Flex direction="column" gap="3">
        <Callout.Root color="red" size="2">
          <Callout.Text>{uploadError ?? 'Upload failed.'}</Callout.Text>
        </Callout.Root>
        <Button variant="soft" onClick={clearFile}>
          Try Again
        </Button>
      </Flex>
    )
  }

  // IDLE state
  return (
    <Flex direction="column" gap="4">
      {alreadySubmitted && (
        <Callout.Root color="amber" size="2">
          <Callout.Text>
            An image has already been submitted for this session.
          </Callout.Text>
        </Callout.Root>
      )}

      <Box
        {...getRootProps()}
        style={{
          border: '2px dashed var(--gray-a7)',
          borderRadius: 'var(--radius-3)',
          padding: 'var(--space-7) var(--space-5)',
          cursor: alreadySubmitted ? 'not-allowed' : 'pointer',
          opacity: alreadySubmitted ? 0.5 : 1,
          backgroundColor: isDragActive ? 'var(--blue-a2)' : 'transparent',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          borderColor: isDragActive ? 'var(--blue-8)' : 'var(--gray-a7)',
        }}
      >
        <input {...getInputProps()} />
        <Flex direction="column" align="center" gap="3">
          <UploadIcon width={32} height={32} color="var(--gray-9)" />
          <Text size="3" weight="medium">
            {isDragActive ? 'Drop image here' : 'Drag and drop a wound image here'}
          </Text>
          <Text size="2" color="gray">or</Text>
          <Button variant="soft" asChild>
            <span>Browse Files</span>
          </Button>
          <Text size="1" color="gray">
            JPG, PNG, WEBP up to 10MB
          </Text>
        </Flex>
      </Box>

      {uploadError && (
        <Callout.Root color="red" size="1">
          <Callout.Text>{uploadError}</Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  )
}
