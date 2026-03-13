'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { StockBadge } from '@/components/search/StockBadge';
import { FreshnessBadge } from '@/components/search/FreshnessBadge';
import type { StockItem } from '@/hooks/useStock';
import { useUpdateStock, useBulkUpdateStock, useConfirmAllStock, useRemoveStock } from '@/hooks/useStock';

const STATUSES = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARRIVING_SOON'] as const;

interface Props {
  items: StockItem[];
  pharmacyId: string;
}

export function StockTable({ items, pharmacyId }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('AVAILABLE');

  const { mutate: update, isPending: updating } = useUpdateStock(pharmacyId);
  const { mutate: bulkUpdate, isPending: bulking } = useBulkUpdateStock(pharmacyId);
  const { mutate: confirmAll, isPending: confirming } = useConfirmAllStock(pharmacyId);
  const { mutate: remove } = useRemoveStock(pharmacyId);

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((s) => s.size === items.length ? new Set() : new Set(items.map((i) => i.id)));
  }

  function handleBulkUpdate() {
    bulkUpdate(Array.from(selected).map((id) => ({ id, status: bulkStatus })));
    setSelected(new Set());
  }

  if (!items.length) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">📦</p>
        <p>{isAr ? 'لا يوجد مخزون بعد' : 'Aucun stock pour le moment'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => confirmAll()}
          disabled={confirming}
          className="btn-secondary text-sm px-4 py-2"
        >
          {confirming ? '…' : (isAr ? '✓ تأكيد الكل' : '✓ Confirmer tout')}
        </button>

        {selected.size > 0 && (
          <>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="input-field text-sm py-2 px-3"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={bulking}
              className="btn-primary text-sm px-4 py-2"
            >
              {bulking ? '…' : `${isAr ? 'تحديث' : 'Mettre à jour'} (${selected.size})`}
            </button>
          </>
        )}

        <span className="text-sm text-gray-500 ms-auto">
          {items.length} {isAr ? 'صنف' : 'articles'}
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-3 text-start">
                <input type="checkbox" checked={selected.size === items.length} onChange={toggleAll} />
              </th>
              <th className="px-3 py-3 text-start font-medium text-gray-600">
                {isAr ? 'الدواء' : 'Médicament'}
              </th>
              <th className="px-3 py-3 text-start font-medium text-gray-600">
                {isAr ? 'الحالة' : 'Statut'}
              </th>
              <th className="px-3 py-3 text-start font-medium text-gray-600">
                {isAr ? 'الكمية' : 'Qté'}
              </th>
              <th className="px-3 py-3 text-start font-medium text-gray-600">
                {isAr ? 'تحديث سريع' : 'Mise à jour rapide'}
              </th>
              <th className="px-3 py-3 text-start font-medium text-gray-600">
                {isAr ? 'الحداثة' : 'Fraîcheur'}
              </th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const medName = isAr && item.medication.nameAr ? item.medication.nameAr : item.medication.nameFr;
              return (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900">{medName}</p>
                    <p className="text-xs text-gray-400">
                      {item.medication.form}
                      {item.medication.dosage && ` · ${item.medication.dosage}`}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <StockBadge status={item.status} />
                  </td>
                  <td className="px-3 py-3 text-gray-600">{item.quantite}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => update({ id: item.id, status: s })}
                          disabled={updating || item.status === s}
                          className={`text-xs px-2 py-1 rounded border transition ${
                            item.status === s
                              ? 'bg-brand-100 border-brand-300 text-brand-700 font-medium'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-brand-300'
                          }`}
                        >
                          {s === 'AVAILABLE' ? '✓' : s === 'LOW_STOCK' ? '⚠' : s === 'OUT_OF_STOCK' ? '✗' : '↑'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <FreshnessBadge lastConfirmedAt={item.lastConfirmedAt} />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => remove(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title={isAr ? 'حذف' : 'Supprimer'}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
