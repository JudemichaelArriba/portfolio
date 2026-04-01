import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogService, DialogConfig, DialogType } from '../../services/dialog.service';

export interface IconConfig {
  svg: string;
  bgFrom: string;
  bgTo: string;
  shadowColor: string;
  btnFrom: string;
  btnTo: string;
  btnShadow: string;
}

const ICON_MAP: Record<DialogType, IconConfig> = {
  success: {
    svg: 'M5 13l4 4L19 7',
    bgFrom: '#0056D2',
    bgTo: '#0099FF',
    shadowColor: 'rgba(0, 86, 210, 0.35)',
    btnFrom: '#0056D2',
    btnTo: '#0099FF',
    btnShadow: 'rgba(0, 86, 210, 0.4)',
  },
  error: {
    svg: 'M6 18L18 6M6 6l12 12',
    bgFrom: '#f87171',
    bgTo: '#e11d48',
    shadowColor: 'rgba(225, 29, 72, 0.35)',
    btnFrom: '#ef4444',
    btnTo: '#e11d48',
    btnShadow: 'rgba(239, 68, 68, 0.4)',
  },
  alert: {
    svg: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    bgFrom: '#fbbf24',
    bgTo: '#f97316',
    shadowColor: 'rgba(249, 115, 22, 0.35)',
    btnFrom: '#f59e0b',
    btnTo: '#f97316',
    btnShadow: 'rgba(245, 158, 11, 0.4)',
  },
  confirm: {
    svg: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bgFrom: '#818cf8',
    bgTo: '#6366f1',
    shadowColor: 'rgba(99, 102, 241, 0.35)',
    btnFrom: '#6366f1',
    btnTo: '#4f46e5',
    btnShadow: 'rgba(99, 102, 241, 0.4)',
  },
};

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.html',
})
export class DialogComponent implements OnInit, OnDestroy {
  config: DialogConfig | null = null;
  visible   = false;
  animating = false;

  private sub!: Subscription;

  constructor(
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub = this.dialogService.dialog$.subscribe(config => {
      if (config) {
        this.config    = config;
        this.visible   = true;
        this.animating = false;
        this.cdr.markForCheck();

        requestAnimationFrame(() => {
          setTimeout(() => {
            this.animating = true;
            this.cdr.markForCheck();
          }, 20);
        });
      } else {
        this.dismiss();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onConfirm(): void {
    const cb = this.config?.onConfirm;
    this.dismiss(() => cb?.());
  }

  onCancel(): void {
    const cb = this.config?.onCancel;
    this.dismiss(() => cb?.());
  }

  get iconConfig(): IconConfig {
    return ICON_MAP[this.config?.type ?? 'alert'];
  }

  iconRingStyle(): Record<string, string> {
    const c = this.iconConfig;
    return {
      background: `linear-gradient(135deg, ${c.bgFrom}, ${c.bgTo})`,
      'box-shadow': `0 8px 24px ${c.shadowColor}`,
    };
  }

  pingStyle(): Record<string, string> {
    const c = this.iconConfig;
    return {
      background: `linear-gradient(135deg, ${c.bgFrom}, ${c.bgTo})`,
    };
  }

  confirmBtnStyle(): Record<string, string> {
    const c = this.iconConfig;
    return {
      background: `linear-gradient(135deg, ${c.btnFrom}, ${c.btnTo})`,
      'box-shadow': `0 4px 14px ${c.btnShadow}`,
    };
  }

  private dismiss(afterDismiss?: () => void): void {
    this.animating = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.visible = false;
      this.config  = null;
      this.cdr.markForCheck();
      afterDismiss?.();
    }, 280);
  }
}
