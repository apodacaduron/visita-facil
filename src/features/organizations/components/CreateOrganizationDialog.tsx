"use client";

import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
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
          <DialogTitle>Create new organization</DialogTitle>
          <DialogDescription>
            Una organización representa a tu museo o institución. Aquí podrás
            llevar el control de tus visitantes y reportes.
          </DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm />
      </DialogContent>
    </Dialog>
  );
}
