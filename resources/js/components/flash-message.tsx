import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FlashMessage() {
    const { flash } = usePage<any>().props;
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (flash.success || flash.error) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!show || (!flash.success && !flash.error)) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
            {flash.success && (
                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                        {flash.success}
                    </AlertDescription>
                </Alert>
            )}
            {flash.error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {flash.error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
