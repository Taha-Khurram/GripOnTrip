import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Animated, Card, Input, OceanHero, Stepper, enterUp } from '@/components/ui';
import { SignInGate } from '@/components/layout/SignInGate';
import { APP_NAME } from '@/constants/config';
import {
  useCreateRentalProperty,
  useRentalProperty,
  useUpdateRentalProperty,
  type RentalPropertyDetail,
} from '@/features/profile';

// App brand mark — same asset the home hero + auth header use.
const logo = require('../../assets/images/icon.png');

const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Villa',
  'Studio',
  'Cottage',
  'Farmhouse',
  'Penthouse',
  'Guest House',
];

const CITIES = [
  'Islamabad',
  'Rawalpindi',
  'Lahore',
  'Karachi',
  'Peshawar',
  'Murree',
  'Naran',
  'Swat',
  'Hunza',
  'Skardu',
  'Multan',
  'Faisalabad',
  'Quetta',
];

const AMENITIES = [
  'Wifi',
  'Air Conditioning',
  'Heating',
  'Kitchen',
  'Parking',
  'Pool',
  'TV',
  'Washer',
  'Dryer',
  'Gym',
  'Balcony',
  'Garden',
  'Elevator',
  'Security',
  'Workspace',
];

const SUPPORT_CONTACT = '+92 345 7394313';
const MAX_IMAGES = 10;
const DESC_MAX = 1000;

function SectionTitle({ icon, children }: { icon: keyof typeof Ionicons.glyphMap; children: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icon} size={18} color="#156473" />
      <Text className="font-display text-lg text-ink">{children}</Text>
    </View>
  );
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text className="text-sm font-body-medium text-ink">
      {children}
      {required ? <Text className="text-danger"> *</Text> : null}
    </Text>
  );
}

/** Single-select chip group (property type, city). */
function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className={[
              'rounded-full border px-3.5 py-2',
              active ? 'border-brand-500 bg-brand-500' : 'border-hairline bg-surface',
            ].join(' ')}
          >
            <Text className={['text-xs font-semibold', active ? 'text-white' : 'text-muted'].join(' ')}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Multi-select chip group (amenities). */
function MultiChipSelect({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            className={[
              'flex-row items-center gap-1 rounded-full border px-3 py-1.5',
              active ? 'border-brand-500 bg-brand-50' : 'border-hairline bg-surface',
            ].join(' ')}
          >
            {active ? <Ionicons name="checkmark" size={12} color="#156473" /> : null}
            <Text className={['text-xs font-medium', active ? 'text-brand-700' : 'text-muted'].join(' ')}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color={value ? '#156473' : '#9aa7ac'} />
        <Text className="text-base text-ink">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: '#156473', false: '#d1d5db' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

/** Curved ocean hero — mirrors the home screen's header (logo + big title). */
function ListPropertyHero({ editing }: { editing: boolean }) {
  return (
    <Animated.View entering={enterUp(0)}>
      <OceanHero className="rounded-b-[36px] px-5 pb-8 pt-6">
        <View className="flex-row items-center gap-2.5">
          <Image source={logo} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="contain" />
          <Text className="font-display text-base text-white">{APP_NAME}</Text>
        </View>

        <Text className="mt-6 font-display-x text-[32px] leading-[38px] text-white">
          {editing ? 'Edit Property' : 'List Your Property'}
        </Text>
        <Text className="mt-2 text-[15px] leading-5 text-white/90">
          {editing
            ? 'Update the details of your rental listing.'
            : 'Fill in the details below to list your property for rent.'}
        </Text>
      </OceanHero>
    </Animated.View>
  );
}

function ListPropertyForm({
  initial,
  editingId,
}: {
  initial?: RentalPropertyDetail;
  editingId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editingId);
  const { mutateAsync: createAsync, isPending: creating } = useCreateRentalProperty();
  const { mutateAsync: updateAsync, isPending: updating } = useUpdateRentalProperty();
  const isPending = creating || updating;

  // Seed straight from `initial` (edit mode) — no effect, so state initializes
  // once and the linter's "no setState in effect" rule is satisfied. The parent
  // gate remounts this form (via `key`) when the loaded listing changes.
  const [title, setTitle] = useState(initial?.title ?? '');
  const [propertyType, setPropertyType] = useState(initial?.propertyType ?? 'House');
  const [ownerPhone, setOwnerPhone] = useState(initial?.ownerPhone ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [pricePerMonth, setPricePerMonth] = useState(
    initial?.pricePerMonth ? String(initial.pricePerMonth) : '',
  );
  const [pricePerDay, setPricePerDay] = useState(
    initial?.pricePerDay ? String(initial.pricePerDay) : '',
  );
  const [bedrooms, setBedrooms] = useState(initial?.bedrooms ?? 1);
  const [bathrooms, setBathrooms] = useState(initial?.bathrooms ?? 1);
  const [areaSqft, setAreaSqft] = useState(initial?.areaSqft ? String(initial.areaSqft) : '');
  const [maxGuests, setMaxGuests] = useState(initial?.maxGuests ?? 2);
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [furnished, setFurnished] = useState(initial?.furnished ?? false);
  const [parking, setParking] = useState(initial?.parkingAvailable ?? false);
  const [petsAllowed, setPetsAllowed] = useState(initial?.petsAllowed ?? false);
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const priceValue = Number(pricePerMonth);
  const canSubmit =
    title.trim().length > 1 &&
    Boolean(propertyType) &&
    ownerPhone.trim().length > 5 &&
    description.trim().length > 5 &&
    Boolean(city) &&
    address.trim().length > 2 &&
    priceValue > 0 &&
    amenities.length > 0;

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url || images.length >= MAX_IMAGES || images.includes(url)) return;
    setImages((prev) => [...prev, url]);
    setImageUrl('');
  };

  const submit = async () => {
    setError(null);
    if (!canSubmit) {
      setError('Please fill in all required fields marked with *.');
      return;
    }
    const input = {
      title: title.trim(),
      description: description.trim(),
      propertyType,
      ownerPhone: ownerPhone.trim(),
      city,
      address: address.trim(),
      pricePerMonth: priceValue,
      pricePerDay: pricePerDay ? Number(pricePerDay) : undefined,
      bedrooms,
      bathrooms,
      areaSqft: areaSqft ? Number(areaSqft) : undefined,
      maxGuests,
      amenities,
      images,
      available,
      furnished,
      parkingAvailable: parking,
      petsAllowed,
    };
    try {
      if (editing && editingId) {
        await updateAsync({ id: editingId, input });
        setConfirmedId(editingId);
      } else {
        const created = await createAsync(input);
        setConfirmedId(created.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your property. Please try again.');
    }
  };

  // ── Confirmation screen ───────────────────────────────────────────────
  if (confirmedId) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6"
      >
        <View className="items-center gap-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-center font-display-x text-2xl text-ink">
              {editing ? 'Property Updated!' : 'Property Listed!'}
            </Text>
            <Text className="text-center text-sm text-muted">
              {editing
                ? `“${title.trim()}” has been updated successfully.`
                : `“${title.trim()}” has been submitted and is pending review. We’ll notify you once it’s approved and live for guests.`}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See my properties"
            onPress={() => router.replace('/my-properties')}
          >
            <View className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4">
              <Ionicons name="business-outline" size={18} color="#ffffff" />
              <Text numberOfLines={1} className="font-body-semibold text-base text-white">
                See My Properties
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            onPress={() => router.replace('/(tabs)')}
          >
            <View className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-brand-500 bg-transparent py-4">
              <Ionicons name="home-outline" size={18} color="#1a7a8c" />
              <Text numberOfLines={1} className="font-body-semibold text-base text-brand-500">
                Back to Home
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="pb-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ListPropertyHero editing={editing} />

        <View className="gap-4 px-5 pt-5">
        {/* Basic Information */}
        <Card className="gap-4">
          <SectionTitle icon="information-circle-outline">Basic Information</SectionTitle>

          <View className="gap-1.5">
            <FieldLabel required>Property Title</FieldLabel>
            <Input
              placeholder="e.g. Luxury Villa in Islamabad"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="gap-1.5">
            <FieldLabel required>Property Type</FieldLabel>
            <ChipSelect options={PROPERTY_TYPES} value={propertyType} onChange={setPropertyType} />
          </View>

          <View className="gap-1.5">
            <FieldLabel required>Owner Phone Number</FieldLabel>
            <Input
              placeholder="e.g. +92 300 1234567"
              keyboardType="phone-pad"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
            />
          </View>

          <View className="gap-1.5">
            <FieldLabel>Support Team Contact</FieldLabel>
            <View className="flex-row items-center gap-2 rounded-2xl border border-hairline bg-surface-sunk/50 px-4 py-3">
              <Ionicons name="call-outline" size={16} color="#156473" />
              <Text className="text-sm font-medium text-ink">{SUPPORT_CONTACT}</Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              For assistance, please contact our support team.
            </Text>
          </View>

          <View className="gap-1.5">
            <FieldLabel required>Description</FieldLabel>
            <TextInput
              placeholder="Describe your property, its features, and what makes it special…"
              placeholderTextColor="#9aa7ac"
              multiline
              maxLength={DESC_MAX}
              value={description}
              onChangeText={setDescription}
              className="min-h-24 rounded-2xl border border-hairline bg-surface px-4 py-3 text-base text-ink"
            />
            <Text className="text-right text-xs text-muted-foreground">
              {description.length} / {DESC_MAX}
            </Text>
          </View>
        </Card>

        {/* Location */}
        <Card className="gap-4">
          <SectionTitle icon="location-outline">Location</SectionTitle>

          <View className="gap-1.5">
            <FieldLabel required>City</FieldLabel>
            <ChipSelect options={CITIES} value={city} onChange={setCity} />
          </View>

          <View className="gap-1.5">
            <FieldLabel required>Address</FieldLabel>
            <Input placeholder="e.g. F-7 Markaz, Islamabad" value={address} onChangeText={setAddress} />
          </View>
        </Card>

        {/* Pricing */}
        <Card className="gap-4">
          <SectionTitle icon="pricetag-outline">Pricing</SectionTitle>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <FieldLabel required>Price per Month</FieldLabel>
              <Input
                placeholder="e.g. 50000"
                keyboardType="numeric"
                value={pricePerMonth}
                onChangeText={setPricePerMonth}
              />
            </View>
            <View className="flex-1 gap-1.5">
              <FieldLabel>Price per Day</FieldLabel>
              <Input
                placeholder="e.g. 2000"
                keyboardType="numeric"
                value={pricePerDay}
                onChangeText={setPricePerDay}
              />
            </View>
          </View>
        </Card>

        {/* Property Details */}
        <Card className="gap-4">
          <SectionTitle icon="bed-outline">Property Details</SectionTitle>

          <View className="gap-1 rounded-2xl border border-hairline p-1">
            <Stepper label="Bedrooms" value={bedrooms} min={0} onChange={setBedrooms} />
            <Stepper label="Bathrooms" value={bathrooms} min={0} onChange={setBathrooms} />
            <Stepper label="Max Guests" value={maxGuests} min={1} onChange={setMaxGuests} />
          </View>

          <View className="gap-1.5">
            <FieldLabel>Area (sqft)</FieldLabel>
            <Input
              placeholder="e.g. 1500"
              keyboardType="numeric"
              value={areaSqft}
              onChangeText={setAreaSqft}
            />
          </View>

          <View className="gap-1.5">
            <FieldLabel required>Amenities</FieldLabel>
            <MultiChipSelect options={AMENITIES} values={amenities} onToggle={toggleAmenity} />
          </View>
        </Card>

        {/* Additional Options */}
        <Card className="gap-4">
          <SectionTitle icon="options-outline">Additional Options</SectionTitle>
          <ToggleRow icon="cube-outline" label="Furnished" value={furnished} onChange={setFurnished} />
          <View className="h-px bg-hairline" />
          <ToggleRow icon="car-outline" label="Parking" value={parking} onChange={setParking} />
          <View className="h-px bg-hairline" />
          <ToggleRow icon="paw-outline" label="Pets Allowed" value={petsAllowed} onChange={setPetsAllowed} />
          <View className="h-px bg-hairline" />
          <ToggleRow icon="checkmark-circle-outline" label="Available" value={available} onChange={setAvailable} />
        </Card>

        {/* Property Images */}
        <Card className="gap-4">
          <SectionTitle icon="images-outline">Property Images</SectionTitle>
          <Text className="-mt-2 text-xs text-muted-foreground">
            Add image links (up to {MAX_IMAGES}). Native photo upload is coming soon.
          </Text>

          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                placeholder="Paste an image URL…"
                autoCapitalize="none"
                keyboardType="url"
                value={imageUrl}
                onChangeText={setImageUrl}
                onSubmitEditing={addImage}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add image"
              disabled={!imageUrl.trim() || images.length >= MAX_IMAGES}
              onPress={addImage}
              className={[
                'h-12 w-12 items-center justify-center rounded-2xl bg-brand-500',
                !imageUrl.trim() || images.length >= MAX_IMAGES ? 'opacity-50' : '',
              ].join(' ')}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
            </Pressable>
          </View>

          {images.length > 0 ? (
            <View className="gap-2">
              {images.map((url, i) => (
                <View
                  key={url}
                  className="flex-row items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-2"
                >
                  <Ionicons name="image-outline" size={16} color="#156473" />
                  <Text className="flex-1 text-xs text-ink" numberOfLines={1}>
                    {url}
                  </Text>
                  <Pressable
                    onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={18} color="#9aa7ac" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        {error ? (
          <View className="rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        {/* Submit — layout/background on the inner View (NativeWind interops a
            plain View reliably; a `flex-row` className on the Pressable itself can
            be dropped on native, stacking the icon above the text). */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Property"
          accessibilityState={{ disabled: !canSubmit || isPending, busy: isPending }}
          disabled={!canSubmit || isPending}
          onPress={submit}
        >
          <View
            className={[
              'w-full flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4',
              !canSubmit || isPending ? 'opacity-50' : '',
            ].join(' ')}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name={editing ? 'save-outline' : 'add-circle-outline'} size={20} color="#ffffff" />
                <Text numberOfLines={1} className="font-body-semibold text-base text-white">
                  {editing ? 'Save Changes' : 'Add Property'}
                </Text>
              </>
            )}
          </View>
        </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Reads the optional `id` param; in edit mode it waits for the listing to load,
 *  then mounts the form seeded with it (keyed so it reinitializes per listing). */
function ListPropertyGate() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, isLoading } = useRentalProperty(id);

  if (id && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a7a8c" />
      </View>
    );
  }

  return <ListPropertyForm key={id ?? 'new'} initial={id ? data : undefined} editingId={id} />;
}

export default function ListPropertyScreen() {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'List Your Property' }} />
      <SignInGate icon="business-outline" message="Sign in to list your property.">
        <ListPropertyGate />
      </SignInGate>
    </View>
  );
}
