import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, input } from '@angular/core';
import type { Block } from '../core/content/content.types';
import { BLOCK_REGISTRY } from './block-registry';

/** Renders a list of blocks by looking each `type` up in the registry. Unknown types are skipped. */
@Component({
  selector: 'app-block-host',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (b of blocks(); track $index) {
      @if (componentFor(b); as cmp) {
        <ng-container [ngComponentOutlet]="cmp" [ngComponentOutletInputs]="{ block: b }" />
      }
    }
  `,
})
export class BlockHostComponent {
  readonly blocks = input.required<Block[]>();

  protected componentFor(block: Block): Type<unknown> | undefined {
    return BLOCK_REGISTRY[block?.type];
  }
}
