'use client';

import type { Key } from '@heroui/react';
import {
  Autocomplete,
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  TextArea,
  TextField,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { COUNTRY_CODES, isoToFlagEmoji } from '@/app/lib/data/country-codes';

type ContactPreference = 'email' | 'phone';
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  salutation: Key | null;
  firstName: string;
  lastName: string;
  contactPreference: ContactPreference;
  email: string;
  countryCode: Key | null;
  phone: string;
  message: string;
}

const SALUTATIONS = [
  { id: 'mr', labelKey: 'salutation-mr' },
  { id: 'ms', labelKey: 'salutation-ms' },
  { id: 'mx', labelKey: 'salutation-mx' },
  { id: 'other', labelKey: 'salutation-other' },
] as const;

const countryItems = COUNTRY_CODES.map((c) => ({
  id: c.iso2,
  dialCode: c.dialCode,
  name: c.name,
  flag: isoToFlagEmoji(c.iso2),
  textValue: `${c.name} ${c.dialCode}`,
}));

type CountryItem = (typeof countryItems)[number];

export default function ContactForm() {
  const t = useTranslations('contact');

  const [form, setForm] = useState<FormState>({
    salutation: null,
    firstName: '',
    lastName: '',
    contactPreference: 'email',
    email: '',
    countryCode: 'GR',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (serverErrors[key]) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setServerErrors({});

    const selectedCountry = COUNTRY_CODES.find(
      (c) => c.iso2 === form.countryCode
    );

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salutation: form.salutation ?? undefined,
          firstName: form.firstName,
          lastName: form.lastName,
          contactPreference: form.contactPreference,
          email: form.contactPreference === 'email' ? form.email : undefined,
          countryCode:
            form.contactPreference === 'phone'
              ? selectedCountry?.dialCode
              : undefined,
          phone: form.contactPreference === 'phone' ? form.phone : undefined,
          message: form.message || undefined,
        }),
      });

      if (res.ok) {
        setStatus('success');
      } else if (res.status === 422) {
        const data = await res.json();
        setServerErrors(data.errors ?? {});
        setStatus('idle');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800/40 dark:bg-green-950/30">
        <p className="text-lg font-semibold text-green-800 dark:text-green-300">
          {t('success-title')}
        </p>
        <p className="mt-2 text-green-700 dark:text-green-400">
          {t('success-body')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Error banner */}
      {status === 'error' && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-950/30">
          <p className="font-semibold text-red-800 dark:text-red-300">
            {t('error-title')}
          </p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
            {t('error-body')}
          </p>
        </div>
      )}

      {/* Salutation (optional) */}
      <Select
        value={form.salutation}
        onChange={(key) => setField('salutation', key)}>
        <Label>{t('salutation-label')}</Label>
        <Select.Trigger>
          <Select.Value>
            {({ isPlaceholder }) =>
              isPlaceholder ? (
                <span className="text-tiff-gray-700 dark:text-tiff-gray-300">
                  {t('salutation-placeholder')}
                </span>
              ) : undefined
            }
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover className="bg-transparent backdrop-blur-md">
          <ListBox className="bg-glass">
            {SALUTATIONS.map((s) => (
              <ListBox.Item key={s.id} id={s.id} textValue={t(s.labelKey)}>
                {t(s.labelKey)}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {/* Name row: single col mobile, 2-col desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          isRequired
          value={form.firstName}
          onChange={(v) => setField('firstName', v)}>
          <Label>{t('first-name-label')}</Label>
          <Input placeholder={t('first-name-placeholder')} />
          {serverErrors.firstName && (
            <FieldError>{serverErrors.firstName}</FieldError>
          )}
        </TextField>

        <TextField
          isRequired
          value={form.lastName}
          onChange={(v) => setField('lastName', v)}>
          <Label>{t('last-name-label')}</Label>
          <Input placeholder={t('last-name-placeholder')} />
          {serverErrors.lastName && (
            <FieldError>{serverErrors.lastName}</FieldError>
          )}
        </TextField>
      </div>

      {/* Contact preference */}
      <RadioGroup
        value={form.contactPreference}
        onChange={(v) => setField('contactPreference', v as ContactPreference)}
        orientation="horizontal"
        className="listing-type-radio-group px-0">
        <Label className="text-base">{t('contact-preference-label')}</Label>
        <div className="flex gap-3">
          {(['email', 'phone'] as const).map((pref) => (
            <Radio
              key={pref}
              value={pref}
              className="listing-type-card group flex-1">
              <Radio.Content className="flex-1">
                <Label className="text-base font-medium">
                  {t(`contact-preference-${pref}`)}
                </Label>
              </Radio.Content>
              <Radio.Control>
                <Radio.Indicator className="radio-indicator-brand" />
              </Radio.Control>
            </Radio>
          ))}
        </div>
      </RadioGroup>

      {/* Conditional: Email */}
      {form.contactPreference === 'email' && (
        <TextField
          isRequired
          type="email"
          value={form.email}
          onChange={(v) => setField('email', v)}>
          <Label>{t('email-label')}</Label>
          <Input placeholder={t('email-placeholder')} />
          {serverErrors.email && <FieldError>{serverErrors.email}</FieldError>}
        </TextField>
      )}

      {/* Conditional: Phone */}
      {form.contactPreference === 'phone' && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Country code autocomplete */}
          <div className="sm:w-56">
            <Autocomplete
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items={countryItems as any}
              value={form.countryCode}
              onChange={(key) => setField('countryCode', key as Key | null)}>
              <Label>{t('country-code-label')}</Label>
              <Autocomplete.Trigger>
                <Autocomplete.Value>
                  {({ selectedItem, isPlaceholder }) => {
                    if (isPlaceholder || !selectedItem) {
                      return (
                        <span className="text-tiff-gray-400">
                          {t('country-code-placeholder')}
                        </span>
                      );
                    }
                    const item = selectedItem as CountryItem;
                    return (
                      <span>
                        {item.flag} {item.dialCode}
                      </span>
                    );
                  }}
                </Autocomplete.Value>
                <Autocomplete.ClearButton />
                <Autocomplete.Indicator />
              </Autocomplete.Trigger>
              <Autocomplete.Popover className="bg-transparent backdrop-blur-md">
                <Autocomplete.Filter>
                  <SearchField>
                    <SearchField.Group>
                      <SearchField.SearchIcon />
                      <SearchField.Input
                        autoFocus
                        placeholder={t('country-code-placeholder')}
                      />
                    </SearchField.Group>
                  </SearchField>
                  <ListBox className="bg-glass">
                    {(item: CountryItem) => (
                      <ListBox.Item
                        key={item.id}
                        id={item.id}
                        textValue={item.textValue}>
                        <span className="mr-2">{item.flag}</span>
                        <span className="font-mono text-sm">
                          {item.dialCode}
                        </span>
                        <span className="ml-2 truncate">{item.name}</span>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    )}
                  </ListBox>
                </Autocomplete.Filter>
              </Autocomplete.Popover>
            </Autocomplete>
          </div>

          {/* Phone number */}
          <div className="flex-1">
            <TextField
              isRequired
              type="tel"
              value={form.phone}
              onChange={(v) => setField('phone', v)}>
              <Label>{t('phone-label')}</Label>
              <Input placeholder={t('phone-placeholder')} />
              {serverErrors.phone && (
                <FieldError>{serverErrors.phone}</FieldError>
              )}
            </TextField>
          </div>
        </div>
      )}

      {/* Message (optional) */}
      <TextField value={form.message} onChange={(v) => setField('message', v)}>
        <Label>{t('message-label')}</Label>
        <TextArea placeholder={t('message-placeholder')} rows={5} />
      </TextField>

      {/* Submit */}
      <Button
        type="submit"
        isDisabled={status === 'submitting'}
        className="bg-tiff-700 dark:bg-brand-primary w-full text-base font-semibold text-white sm:w-auto sm:self-end">
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
