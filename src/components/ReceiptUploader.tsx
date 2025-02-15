
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const ReceiptUploader = ({ onUpload, isProcessing = false }: ReceiptUploaderProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <Card className={`shadow-sm ${isProcessing ? 'opacity-50' : ''}`}>
      <CardContent className="p-8">
        <div {...getRootProps()} className={`cursor-pointer ${isProcessing ? 'pointer-events-none' : ''}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload de Recibos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isProcessing
                ? "Processando..."
                : isDragActive
                ? "Solte o arquivo aqui..."
                : "Arraste e solte seus recibos aqui ou clique para selecionar"}
            </p>
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : "Selecionar Arquivo"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
