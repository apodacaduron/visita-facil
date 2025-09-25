"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogProps } from '@radix-ui/react-dialog';

import CreateOrganizationForm from './CreateOrganizationForm';

type Props = {
  dialogProps: DialogProps;
};

export default function CreateOrganizationDialog(props: Props) {
  return (
    <Dialog {...props.dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create new organization
          </DialogTitle>
        </DialogHeader>
        <CreateOrganizationForm />
      </DialogContent>
    </Dialog>
  );
}
