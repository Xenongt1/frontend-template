import { renderHook, act } from '@testing-library/react';
import { useInventoryForm } from './useInventoryForm';
import type { InventoryItem } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    sku: 'STL-001',
    displayName: 'Sheet Steel',
    category: 'RAW_MATERIAL',
    uomLabel: 'Kilogram',
    baseUnitOfMeasure: 'Kilogram',
    status: 'ACTIVE',
    description: 'Steel sheets',
    reorderThreshold: 50,
    expiryNotificationDays: 30,
    properties: [],
    stockIntakeProperties: [],
    attributes: [],
    grades: [],
    batchFields: [],
    expiryNotificationSchedule: [],
    tags: [],
    stockUnit: 1,
    ...overrides,
  };
}

function fillStep0(result: { current: ReturnType<typeof useInventoryForm> }) {
  act(() => {
    result.current.handleBasicInfoChange('name', 'Sheet Steel');
    result.current.handleBasicInfoChange('category', 'cat-1');
    result.current.handleBasicInfoChange('uom', 'uom-kg');
    result.current.handleBasicInfoChange('stockUnit', '1');
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useInventoryForm', () => {
  // ── Step 0 validation ──────────────────────────────────────────────────────

  describe('goNext — step 0 validation', () => {
    it('blocks navigation and populates errors when all required fields are empty', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => { result.current.goNext(); });

      expect(result.current.activeStep).toBe(0);
      expect(result.current.stepErrors.name).toBeDefined();
      expect(result.current.stepErrors.category).toBeDefined();
      expect(result.current.stepErrors.uom).toBeDefined();
    });

    it('sets a "at least 2 characters" error when name is one character', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => {
        result.current.handleBasicInfoChange('name', 'A');
        result.current.handleBasicInfoChange('category', 'cat-1');
        result.current.handleBasicInfoChange('uom', 'uom-kg');
        result.current.handleBasicInfoChange('stockUnit', '1');
      });
      act(() => { result.current.goNext(); });

      expect(result.current.activeStep).toBe(0);
      expect(result.current.stepErrors.name).toMatch(/at least 2/i);
    });

    it('advances to step 1 and clears errors when all required fields are valid', () => {
      const { result } = renderHook(() => useInventoryForm());

      fillStep0(result);
      act(() => { result.current.goNext(); });

      expect(result.current.activeStep).toBe(1);
      expect(result.current.stepErrors).toEqual({});
    });
  });

  // ── Step 1 (Properties) validation ────────────────────────────────────────

  describe('goNext — step 1 (Properties) advances to step 2', () => {
    it('advances to step 2 with no intake fields', () => {
      const { result } = renderHook(() => useInventoryForm());

      fillStep0(result);
      act(() => { result.current.goNext(); });
      expect(result.current.activeStep).toBe(1);

      act(() => { result.current.goNext(); });

      expect(result.current.activeStep).toBe(2);
      expect(result.current.stepErrors).toEqual({});
    });
  });

  // ── Step 2 (Notifications) validation ─────────────────────────────────────

  describe('goNext — step 2 (Notifications) validation', () => {
    it('blocks when expiry alert is enabled but days is empty', async () => {
      const { result } = renderHook(() => useInventoryForm());

      fillStep0(result);
      // advance to step 1 then step 2
      await act(async () => { await result.current.goNext(); });
      await act(async () => { await result.current.goNext(); });
      expect(result.current.activeStep).toBe(2);

      act(() => { result.current.handleToggleExpiryAlert(); });
      act(() => { result.current.goNext(); });

      expect(result.current.activeStep).toBe(2);
      expect(result.current.stepErrors.expiryDays).toBeDefined();
    });

    it('advances to step 3 when no alerts are enabled', async () => {
      const { result } = renderHook(() => useInventoryForm());

      fillStep0(result);
      await act(async () => { await result.current.goNext(); });
      await act(async () => { await result.current.goNext(); });
      await act(async () => { await result.current.goNext(); });

      expect(result.current.activeStep).toBe(3);
      expect(result.current.stepErrors).toEqual({});
    });
  });

  // ── Error clearing ─────────────────────────────────────────────────────────

  describe('handleBasicInfoChange — error clearing', () => {
    it('clears the error for the changed field only', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => { result.current.goNext(); });
      expect(result.current.stepErrors.name).toBeDefined();

      act(() => { result.current.handleBasicInfoChange('name', 'Sheet Steel'); });

      expect(result.current.stepErrors.name).toBeUndefined();
    });
  });

  // ── goPrev ─────────────────────────────────────────────────────────────────

  describe('goPrev', () => {
    it('clears step errors when navigating back', async () => {
      const { result } = renderHook(() => useInventoryForm());

      fillStep0(result);
      await act(async () => { await result.current.goNext(); });
      await act(async () => { await result.current.goNext(); });

      act(() => { result.current.handleToggleExpiryAlert(); });
      act(() => { result.current.goNext(); });
      expect(result.current.stepErrors.expiryDays).toBeDefined();

      act(() => { result.current.goPrev(); });

      expect(result.current.activeStep).toBe(1);
      expect(result.current.stepErrors).toEqual({});
    });
  });

  // ── buildPayload ───────────────────────────────────────────────────────────

  describe('buildPayload', () => {
    it('returns the correct shape with required fields', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => {
        result.current.handleBasicInfoChange('name', 'Sheet Steel');
        result.current.handleBasicInfoChange('category', 'cat-1');
        result.current.handleBasicInfoChange('uom', 'uom-kg');
        result.current.handleBasicInfoChange('stockUnit', '2.5');
        result.current.handleBasicInfoChange('description', 'Steel sheets');
      });

      const payload = result.current.buildPayload();

      expect(payload).toMatchObject({
        name: 'Sheet Steel',
        categoryId: 'cat-1',
        stockUnit: 2.5,
        description: 'Steel sheets',
      });
    });

    it('includes minStockReorderLevel when reorder alert is enabled with a value', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => {
        result.current.handleToggleReorderAlert();
        result.current.setReorderLevel('50');
      });

      expect(result.current.buildPayload().minStockReorderLevel).toBe(50);
      expect(result.current.buildPayload().reorderOnMinStockEnabled).toBe(true);
    });

    it('sets minStockReorderLevel even when alert is disabled', () => {
      const { result } = renderHook(() => useInventoryForm());
      act(() => { result.current.setReorderLevel('50'); });
      expect(result.current.buildPayload().minStockReorderLevel).toBe(50);
      expect(result.current.buildPayload().reorderOnMinStockEnabled).toBe(false);
    });

    it('includes daysBeforeExpiryNotification when expiry alert is enabled', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => {
        result.current.handleToggleExpiryAlert();
        result.current.setExpiryDays('30');
      });

      expect(result.current.buildPayload().daysBeforeExpiryNotification).toBe(30);
      expect(result.current.buildPayload().notifyExpiryEnabled).toBe(true);
    });

    it('sets daysBeforeExpiryNotification even when alert is disabled', () => {
      const { result } = renderHook(() => useInventoryForm());
      act(() => { result.current.setExpiryDays('30'); });
      expect(result.current.buildPayload().daysBeforeExpiryNotification).toBe(30);
      expect(result.current.buildPayload().notifyExpiryEnabled).toBe(false);
    });

    it('maps intake fields to stockIntakeProperties with uppercase type', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => { result.current.handleIntakeFieldDraftLabelChange('Batch No'); });
      act(() => { result.current.handleAddIntakeFieldFromDraft(); });

      const { stockIntakeProperties } = result.current.buildPayload();
      expect(stockIntakeProperties).toHaveLength(1);
      expect(stockIntakeProperties[0].label).toBe('Batch No');
      expect(stockIntakeProperties[0].type).toBe('STRING');
    });
  });

  // ── populateForm ───────────────────────────────────────────────────────────

  describe('populateForm', () => {
    const cats = [{ label: 'Raw Material', value: 'cat-raw' }];
    const uoms = [{ label: 'Kilogram', value: 'uom-kg' }];

    it('pre-fills basicInfo from the item', () => {
      const { result } = renderHook(() => useInventoryForm());
      const item = makeItem({ reorderThreshold: 25, description: 'desc' });

      act(() => { result.current.populateForm(item, cats, uoms); });

      expect(result.current.basicInfo.name).toBe('Sheet Steel');
      expect(result.current.reorderLevel).toBe('25');
      expect(result.current.basicInfo.description).toBe('desc');
    });

    it('matches category and uom by normalized name', () => {
      const { result } = renderHook(() => useInventoryForm());
      act(() => { result.current.populateForm(makeItem(), cats, uoms); });

      expect(result.current.basicInfo.category).toBe('cat-raw');
      expect(result.current.basicInfo.uom).toBe('uom-kg');
    });

    it('leaves category empty when no option matches', () => {
      const { result } = renderHook(() => useInventoryForm());
      act(() => { result.current.populateForm(makeItem({ category: 'UNKNOWN' }), cats, uoms); });
      expect(result.current.basicInfo.category).toBe('');
    });

    it('pre-fills expiryDays, grades, attributes, and intakeFields', () => {
      const { result } = renderHook(() => useInventoryForm());
      const item = makeItem({
        expiryNotificationDays: 30,
        properties: [{ id: 'p1', label: 'Grade', value: 'A', type: 'STRING' }],
        grades: [{ name: 'Premium', rank: 1 }],
        stockIntakeProperties: [{
          label: 'Batch No', required: true,
          id: '',
          type: ''
        }],
      });

      act(() => { result.current.populateForm(item, cats, uoms); });

      expect(result.current.expiryDays).toBe('30');
      expect(result.current.enableExpiryAlert).toBe(true);
      expect(result.current.attributes).toHaveLength(1);
      expect(result.current.attributes[0].label).toBe('Grade');
      expect(result.current.grades).toHaveLength(1);
      expect(result.current.grades[0].name).toBe('Premium');
      expect(result.current.intakeFields).toHaveLength(1);
      expect(result.current.intakeFields[0].label).toBe('Batch No');
    });

    it('enables reorder alert when reorderThreshold > 0', () => {
      const { result } = renderHook(() => useInventoryForm());
      act(() => { result.current.populateForm(makeItem({ reorderThreshold: 50 }), cats, uoms); });
      expect(result.current.enableReorderAlert).toBe(true);
      expect(result.current.reorderLevel).toBe('50');
    });

    it('clears stepErrors after populate', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => { result.current.goNext(); });
      expect(Object.keys(result.current.stepErrors).length).toBeGreaterThan(0);

      act(() => { result.current.populateForm(makeItem(), cats, uoms); });

      expect(result.current.stepErrors).toEqual({});
    });
  });

  // ── Tags ───────────────────────────────────────────────────────────────────

  describe('tags', () => {
    it('adds and removes tags', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => { result.current.setTagDraft('imported'); });
      act(() => { result.current.handleAddTag(); });

      expect(result.current.tags).toContain('imported');

      act(() => { result.current.handleRemoveTag('imported'); });
      expect(result.current.tags).not.toContain('imported');
    });

    it('does not add duplicate tags', () => {
      const { result } = renderHook(() => useInventoryForm());

      act(() => { result.current.setTagDraft('imported'); });
      act(() => { result.current.handleAddTag(); });
      act(() => { result.current.setTagDraft('imported'); });
      act(() => { result.current.handleAddTag(); });

      expect(result.current.tags.filter((t) => t === 'imported')).toHaveLength(1);
    });
  });
});
