import { forwardRef, type FormHTMLAttributes, type LabelHTMLAttributes, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  error?: boolean;
}

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface FormHelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  error?: boolean;
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('space-y-6', className)}
      {...props}
    >
      {children}
    </form>
  )
);
Form.displayName = 'Form';

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, error, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-2', error && 'form-field-error', className)}
      {...props}
    >
      {children}
    </div>
  )
);
FormField.displayName = 'FormField';

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-gray-300',
        'tracking-wide',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-loss-400 ml-1">*</span>}
    </label>
  )
);
FormLabel.displayName = 'FormLabel';

const FormError = forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-loss-400 font-medium', className)}
      {...props}
    >
      {children}
    </p>
  )
);
FormError.displayName = 'FormError';

const FormHelperText = forwardRef<HTMLParagraphElement, FormHelperTextProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  )
);
FormHelperText.displayName = 'FormHelperText';

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, children, error, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
        'transition-all duration-200',
        'hover:border-slate-600/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-loss-500/50 focus:ring-loss-500/50 focus:border-loss-500/50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
FormSelect.displayName = 'FormSelect';

export { 
  Form, 
  FormField, 
  FormLabel, 
  FormError, 
  FormHelperText,
  FormSelect
};