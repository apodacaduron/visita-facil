import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
    AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { AlertDialogProps } from '@radix-ui/react-alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Props = {
  onSuccess?: () => void;
  itemId: string | null | undefined;
  itemName: string | null | undefined;
  dialogProps: AlertDialogProps;
  queryKeyGetter(): unknown[];
};

export default function DeleteMemberDialog(props: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!props.itemId)
        throw new Error("Could not delete member, id was not provided");

      return supabase
        .from("organization_memberships")
        .delete()
        .eq("id", props.itemId)
        .throwOnError();
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: props.queryKeyGetter() });
      toast.success("Member deleted");
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("Failed to delete member", {
        description: error.message,
      });
    },
  });

  return (
    <AlertDialog {...props.dialogProps}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this member?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the member from your organization. <br />
            <br />
            Member to delete: <b>{props.itemName}</b>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            variant="destructive"
          >
            {deleteMutation.isPending && <Loader2Icon className="animate-spin mr-2" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
