import { Modal } from './Modal'
import { Button } from '../buttons/Button'

interface Props {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ title, message, onCancel, onConfirm }: Props) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline-dark" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} className="!bg-admin-danger hover:!bg-admin-danger/90">
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-admin-text2">{message}</p>
    </Modal>
  )
}
