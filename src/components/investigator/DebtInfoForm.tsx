'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Hash, User, Building2, MapPin, FileText } from 'lucide-react';
import { DebtTypeId, DebtInfo } from '@/types';
import { DEBT_TYPES, getServicersByDebtType } from '@/lib';
import { createDebtInfoSchema } from '@/lib/utils/validation';
import { cn } from '@/lib/utils';
import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Button,
  Card,
} from '@/components/ui';

interface DebtInfoFormProps {
  debtType: DebtTypeId;
  initialData?: DebtInfo;
  onSubmit: (data: DebtInfo) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const fieldIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  borrowerName: User,
  accountNumber: Hash,
  originalLender: Building2,
  currentServicer: Building2,
  propertyAddress: MapPin,
  originalAmount: DollarSign,
  currentBalance: DollarSign,
  originationDate: Calendar,
  lastPaymentDate: Calendar,
  vehicleInfo: FileText,
  utilityType: FileText,
  cardIssuer: Building2,
  schoolName: Building2,
  providerName: Building2,
  facilityName: Building2,
};

const fieldLabels: Record<string, string> = {
  borrowerName: 'Borrower Name',
  accountNumber: 'Account Number',
  originalLender: 'Original Lender',
  currentServicer: 'Current Servicer',
  propertyAddress: 'Property Address',
  originalAmount: 'Original Amount',
  currentBalance: 'Current Balance',
  originationDate: 'Origination Date',
  lastPaymentDate: 'Last Payment Date',
  vehicleInfo: 'Vehicle Information',
  utilityType: 'Utility Type',
  cardIssuer: 'Card Issuer',
  schoolName: 'School Name',
  providerName: 'Provider Name',
  facilityName: 'Facility Name',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function DebtInfoForm({
  debtType,
  initialData = {},
  onSubmit,
  onBack,
  isLoading = false,
}: DebtInfoFormProps) {
  const debtTypeConfig = DEBT_TYPES[debtType];
  const servicers = useMemo(() => Object.values(getServicersByDebtType(debtType)), [debtType]);
  const schema = useMemo(() => createDebtInfoSchema(debtType), [debtType]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DebtInfo>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  useEffect(() => {
    reset(initialData);
  }, [debtType, initialData, reset]);

  const renderField = (fieldName: string, isRequired: boolean) => {
    const Icon = fieldIcons[fieldName] || FileText;
    const label = fieldLabels[fieldName] || fieldName;
    const error = errors[fieldName as keyof DebtInfo];

    // Handle servicer as select
    if (fieldName === 'currentServicer') {
      return (
        <motion.div key={fieldName} variants={item} className="space-y-2">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Controller
            name="currentServicer"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a servicer..." />
                </SelectTrigger>
                <SelectContent>
                  {servicers.map((servicer) => (
                    <SelectItem key={servicer.id} value={servicer.name}>
                      {servicer.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other / Not Listed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {error && (
            <p className="text-xs text-destructive">{error.message}</p>
          )}
        </motion.div>
      );
    }

    // Handle date fields
    if (fieldName.includes('Date')) {
      return (
        <motion.div key={fieldName} variants={item} className="space-y-2">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id={fieldName}
            type="date"
            {...register(fieldName as keyof DebtInfo)}
            className={cn(error && 'border-destructive')}
          />
          {error && (
            <p className="text-xs text-destructive">{error.message}</p>
          )}
        </motion.div>
      );
    }

    // Handle amount fields
    if (fieldName.includes('Amount') || fieldName.includes('Balance')) {
      return (
        <motion.div key={fieldName} variants={item} className="space-y-2">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id={fieldName}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={cn('pl-7', error && 'border-destructive')}
              {...register(fieldName as keyof DebtInfo, { valueAsNumber: true })}
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error.message}</p>
          )}
        </motion.div>
      );
    }

    // Default text input
    return (
      <motion.div key={fieldName} variants={item} className="space-y-2">
        <Label htmlFor={fieldName} className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={fieldName}
          type="text"
          placeholder={`Enter ${label.toLowerCase()}...`}
          className={cn(error && 'border-destructive')}
          {...register(fieldName as keyof DebtInfo)}
        />
        {error && (
          <p className="text-xs text-destructive">{error.message}</p>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `rgb(var(--${debtType}) / 0.1)` }}
          >
            <debtTypeConfig.icon
              className="h-5 w-5"
              style={{ color: `rgb(var(--${debtType}))` }}
            />
          </div>
          <div>
            <h3 className="font-semibold">{debtTypeConfig.name} Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter your debt information to search for securitization
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Required Fields */}
          {debtTypeConfig.fields.required.map((field) =>
            renderField(field, true)
          )}

          {/* Optional Fields */}
          {debtTypeConfig.fields.optional.map((field) =>
            renderField(field, false)
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            type="submit"
            variant={debtType}
            className="ml-auto"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Searching...
              </>
            ) : (
              'Search for Trusts'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
