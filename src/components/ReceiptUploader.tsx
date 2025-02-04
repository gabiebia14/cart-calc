import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
}

export const ReceiptUploader = ({ onUpload }: ReceiptUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
        toast.success('Recibo enviado com sucesso!');
      } else {
        toast.error('Por favor, envie apenas imagens.');
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <Card className="shadow-sm">
      <CardContent className="p-8">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload de Recibos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isDragActive
                ? "Solte o arquivo aqui..."
                : "Arraste e solte seus recibos aqui ou clique para selecionar"}
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Selecionar Arquivo
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};