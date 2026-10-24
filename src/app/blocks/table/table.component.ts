import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TableBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().columns?.length && block().rows?.length) {
      <section class="section">
        <div class="container">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <div class="table-wrap" tabindex="0">
            <table>
              <thead>
                <tr>
                  @for (c of block().columns ?? []; track $index) {
                    <th scope="col">{{ c }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of block().rows ?? []; track $index) {
                  <tr>
                    @for (cell of row.cells ?? []; track $index) {
                      <td>{{ cell }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
    }
  `,
})
export class TableComponent {
  readonly block = input.required<TableBlock>();
}

