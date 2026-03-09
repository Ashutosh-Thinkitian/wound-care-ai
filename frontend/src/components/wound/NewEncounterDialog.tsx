import { useState } from 'react'
import { Dialog, Button, Flex, Text, TextField, Callout } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useCreateSession } from '@/hooks/useCreateSession'

interface NewEncounterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewEncounterDialog({ open, onOpenChange }: NewEncounterDialogProps) {
  const [patientRef, setPatientRef] = useState('')
  const { createSession, loading, error } = useCreateSession()

  const handleCreate = async () => {
    await createSession(patientRef.trim() || undefined)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!loading) {
      onOpenChange(nextOpen)
      if (!nextOpen) {
        setPatientRef('')
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>New Wound Assessment Encounter</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Optionally add a patient reference (e.g. room number or case ID).
          No personal identifying information.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <label>
            <Text as="p" size="2" weight="medium" mb="1">
              Patient Reference
            </Text>
            <TextField.Root
              placeholder="e.g. Room 12B, Case #4421"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              autoFocus
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate()
                }
              }}
            />
            <Text size="1" color="gray" mt="1">
              Optional. Used only to help you identify this session.
            </Text>
          </label>

          <Callout.Root color="blue" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              A QR code will be generated. The patient or clinician scans it on a mobile
              device to capture the wound photo.
            </Callout.Text>
          </Callout.Root>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
        </Flex>

        <Flex justify="end" gap="3" mt="5">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={loading}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleCreate} loading={loading}>
            Generate QR Code
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
