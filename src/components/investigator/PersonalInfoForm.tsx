'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Info,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Input,
  Label,
  Button,
  Card,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  ssnLast4: string;
  dateOfBirth?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email?: string;
  phone?: string;
}

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfo>;
  onSubmit: (data: PersonalInfo) => void;
  isLoading?: boolean;
}

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

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export function PersonalInfoForm({
  initialData = {},
  onSubmit,
  isLoading = false,
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<Partial<PersonalInfo>>({
    firstName: '',
    lastName: '',
    ssnLast4: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    phone: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({});

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalInfo, string>> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.ssnLast4?.trim() || formData.ssnLast4.length !== 4) {
      newErrors.ssnLast4 = 'Last 4 digits of SSN required';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode?.trim() || !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Valid ZIP code required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as PersonalInfo);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Your Information</h2>
            <p className="text-muted-foreground mt-1">
              Enter your personal details to search for securitized debts in your name
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your information is encrypted and never stored on our servers. We only use it to search public records.
          </p>
        </div>

        {/* Form Fields */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className={cn(errors.firstName && 'border-destructive')}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={cn(errors.lastName && 'border-destructive')}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </motion.div>
          </div>

          {/* SSN and DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="ssnLast4" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Last 4 of SSN <span className="text-destructive">*</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Used to verify identity when searching debt records. Only the last 4 digits are needed.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="ssnLast4"
                type="password"
                placeholder="••••"
                maxLength={4}
                value={formData.ssnLast4}
                onChange={(e) => updateField('ssnLast4', e.target.value.replace(/\D/g, ''))}
                className={cn('font-mono', errors.ssnLast4 && 'border-destructive')}
              />
              {errors.ssnLast4 && (
                <p className="text-xs text-destructive">{errors.ssnLast4}</p>
              )}
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                Date of Birth <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
              />
            </motion.div>
          </div>

          {/* Address */}
          <motion.div variants={item} className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="123 Main Street, Apt 4B"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              className={cn(errors.address && 'border-destructive')}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </motion.div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={item} className="space-y-2 col-span-2 md:col-span-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={cn(errors.city && 'border-destructive')}
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city}</p>
              )}
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  errors.state && 'border-destructive'
                )}
              >
                <option value="">Select</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state}</p>
              )}
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="zipCode">
                ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zipCode"
                placeholder="10001"
                maxLength={10}
                value={formData.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                className={cn(errors.zipCode && 'border-destructive')}
              />
              {errors.zipCode && (
                <p className="text-xs text-destructive">{errors.zipCode}</p>
              )}
            </motion.div>
          </div>

          {/* Contact Info (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
