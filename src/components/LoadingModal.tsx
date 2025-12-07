import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal = ({ isOpen }: LoadingModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-background border-primary/20">
        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-lg text-foreground">
            Consulting the AI Gods...
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground pt-2">
            This is the first time someone has asked about this region and era. 
            Please wait while we consult the AI gods for their wisdom.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="loading-pulse" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
