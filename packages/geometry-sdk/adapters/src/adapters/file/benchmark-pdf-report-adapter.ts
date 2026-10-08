import PDFDocument from 'pdfkit';
import type { BenchmarkPdfInstance, BenchmarkPdfReportModel } from './benchmark-pdf-report.model.js';

const colors = {
  ink: '#000000',
  muted: '#808080',
  border: '#D3D3D3',
  blue: '#1E90FF',
  green: '#008000',
  orange: '#FF8C00',
  failed: '#B22222',
} as const;
const lineColors = [colors.blue, colors.green, colors.orange, '#B22222', '#008B8B'];
const margin = 42;

function providerLabel(adapter: string): string {
  if (adapter === 'mongodb') return 'MongoDB Atlas';
  if (adapter === 'firebase') return 'Firebase Store';
  if (adapter === 'memory') return 'In-memory Collection';
  return 'Unknown adapter';
}

function shortText(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit - 1)}...` : value;
}

function formatDuration(value: number | null): string {
  return value === null ? '-' : `${value.toFixed(1)} ms`;
}

export class BenchmarkPdfReportAdapter {
  /** Renders one benchmark report as a PDF buffer. */
  async create(model: BenchmarkPdfReportModel): Promise<Buffer> {
    return this.createMany([model]);
  }

  /** Renders several benchmark reports into one multi-page PDF buffer. */
  async createMany(models: BenchmarkPdfReportModel[]): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({ size: 'A4', margin, bufferPages: true });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', reject);
      document.on('end', () => resolve(Buffer.concat(chunks)));
      try {
        models.forEach((model, index) => {
          if (index > 0) document.addPage();
          this.render(document, model);
        });
        this.addFooters(document, models.length);
        document.end();
      } catch (error) {
        document.destroy(error instanceof Error ? error : new Error('Unable to render PDF report.'));
        reject(error);
      }
    });
  }

  private render(document: PDFKit.PDFDocument, model: BenchmarkPdfReportModel): void {
    let y = margin;
    const width = document.page.width - margin * 2;
    document.fillColor(colors.ink).font('Helvetica-Bold').fontSize(22)
      .text('Benchmark Report', margin, y, { width });
    y += 31;
    document.fontSize(12).text(`Server: ${model.serverName}`, margin, y, { width });
    y += 22;
    document.fillColor(colors.muted).font('Helvetica').fontSize(9)
      .text(`${model.startedAt.toLocaleString()} - ${model.stoppedAt.toLocaleString()}  |  ${model.intervalSeconds === 0 ? 'Continuous checks' : `${model.intervalSeconds} s between checks`}`, margin, y, { width });
    y += 15;
    document.text(`Generated ${model.generatedAt.toLocaleString()}  |  ${model.instances.length} instances  |  ${model.adapters.length} adapters`, margin, y, { width });
    y += 27;

    const allSamples = model.instances.flatMap((instance) => instance.samples);
    const queryCount = model.instances.reduce((sum, instance) => sum + instance.queryCount, 0);
    const failedCount = model.instances.reduce((sum, instance) => sum + instance.failedQueryCount, 0);
    const total = allSamples.reduce((sum, sample) => sum + sample.updateTimeMs, 0);
    const footprint = model.instances.reduce((sum, instance) => sum + (instance.footprintBytes ?? 0), 0);
    y = this.summary(document, y, [
      ['Total Queries', String(queryCount)],
      ['Failed queries', String(failedCount)],
      ['Average update', formatDuration(allSamples.length ? total / allSamples.length : null)],
      ['Total footprint', `${footprint} B`],
    ]);

    const firstTime = model.firstObservedAt;
    const lastTime = model.lastObservedAt;
    y = this.chart(document, y, 'Update time by instance',
      'One line per instance. Vertical position uses a detailed logarithmic scale.',
      model.instances.map((instance, index) => ({
        label: instance.name,
        color: lineColors[index % lineColors.length],
        points: instance.samples.map((sample) => ({ time: sample.observedAt, value: sample.updateTimeMs })),
      })), firstTime, lastTime);
    y = this.chart(document, y, 'Average update comparison',
      'Instance update times with the mean of all successful queries as a gray reference line.',
      model.instances.map((instance, index) => ({
        label: instance.name,
        color: lineColors[index % lineColors.length],
        points: instance.samples.map((sample) => ({ time: sample.observedAt, value: sample.updateTimeMs })),
      })), firstTime, lastTime, undefined, model.averageUpdateTimeMs);
    y = this.chart(document, y, 'Update time by adapter',
      'Successful query times by adapter; red bars count failed connection queries.',
      model.adapters.map((adapter, index) => ({
        label: `${providerLabel(adapter.adapter)} (${adapter.instanceCount})`,
        color: lineColors[index % lineColors.length],
        points: adapter.values.map((value, window) => value === null ? null : ({
          time: firstTime + (window + 0.5) / adapter.values.length * Math.max(lastTime - firstTime, 1),
          value,
        })),
      })), firstTime, lastTime, model.failedQueriesByWindow);
    this.instanceTable(document, y, model.instances);

  }

  private addFooters(document: PDFKit.PDFDocument, serverCount: number): void {
    const pages = document.bufferedPageRange();
    const width = document.page.width - margin * 2;
    for (let index = pages.start; index < pages.start + pages.count; index += 1) {
      document.switchToPage(index);
      const footerY = document.page.height - margin - 24;
      document.strokeColor(colors.border).lineWidth(0.5)
        .moveTo(margin, footerY - 7)
        .lineTo(document.page.width - margin, footerY - 7).stroke();
      document.fillColor(colors.muted).font('Helvetica').fontSize(8)
        .text(shortText(`Benchmark Report  |  ${serverCount} ${serverCount === 1 ? 'server' : 'servers'}`, 70), margin, footerY, { width: width - 60, lineBreak: false });
      document.text(`${index - pages.start + 1} / ${pages.count}`, document.page.width - margin - 50, footerY, { width: 50, align: 'right', lineBreak: false });
    }
  }

  private ensureSpace(document: PDFKit.PDFDocument, y: number, height: number): number {
    if (y + height > document.page.height - 55) {
      document.addPage();
      return margin;
    }
    return y;
  }

  private summary(document: PDFKit.PDFDocument, proposedY: number, items: Array<[string, string]>): number {
    const y = this.ensureSpace(document, proposedY, 86);
    const gap = 8;
    const cardWidth = (document.page.width - margin * 2 - gap * 3) / 4;
    items.forEach(([label, value], index) => {
      const x = margin + index * (cardWidth + gap);
      document.roundedRect(x, y, cardWidth, 65, 6).strokeColor(colors.border).stroke();
      document.font('Helvetica').fontSize(8).fillColor(colors.muted)
        .text(label, x + 9, y + 11, { width: cardWidth - 18, lineBreak: false });
      document.font('Helvetica-Bold').fontSize(13).fillColor(colors.ink)
        .text(value, x + 9, y + 31, { width: cardWidth - 18, lineBreak: false });
    });
    return y + 84;
  }

  private chart(
    document: PDFKit.PDFDocument,
    proposedY: number,
    title: string,
    description: string,
    series: Array<{ label: string; color: string; points: Array<{ time: number; value: number } | null> }>,
    firstTime: number,
    lastTime: number,
    failedQueriesByWindow?: number[],
    averageUpdateTimeMs?: number | null,
  ): number {
    const width = document.page.width - margin * 2;
    const y = this.ensureSpace(document, proposedY, 250);
    document.font('Helvetica-Bold').fontSize(12).fillColor(colors.ink).text(title, margin, y, { width });
    document.font('Helvetica').fontSize(8).fillColor(colors.muted).text(description, margin, y + 18, { width });
    const plotX = margin + 37;
    const plotY = y + 42;
    const plotWidth = width - 50;
    const plotHeight = 145;
    const values = series.flatMap((item) => item.points.flatMap((point) => point ? [point.value] : []));
    if (averageUpdateTimeMs !== null && averageUpdateTimeMs !== undefined) values.push(averageUpdateTimeMs);
    if (!values.length && !failedQueriesByWindow?.some((count) => count > 0)) {
      document.fontSize(9).text('No measurements recorded.', plotX, plotY + 65);
      return y + 215;
    }
    const minimum = Math.max(1, (values.length
      ? values.reduce((value, current) => Math.min(value, current), Infinity)
      : 1) * 0.7);
    const maximum = Math.max(minimum * 1.001, values.reduce((value, current) => Math.max(value, current), 2) * 1.05);
    const ratio = maximum / minimum;
    const x = (time: number) => plotX + (lastTime === firstTime ? 0.5 : (time - firstTime) / (lastTime - firstTime)) * plotWidth;
    const ordinate = (value: number) => plotY + plotHeight - Math.log(Math.max(value, minimum) / minimum) / Math.log(ratio) * plotHeight;
    for (let tick = 0; tick <= 4; tick += 1) {
      const rowY = plotY + plotHeight - tick / 4 * plotHeight;
      document.strokeColor(colors.border).lineWidth(0.5).moveTo(plotX, rowY).lineTo(plotX + plotWidth, rowY).stroke();
      document.font('Helvetica').fontSize(7).fillColor(colors.muted)
        .text(String(Math.round(minimum * ratio ** (tick / 4))), margin, rowY - 4, { width: 32, align: 'right' });
    }
    if (averageUpdateTimeMs !== null && averageUpdateTimeMs !== undefined) {
      const averageY = ordinate(averageUpdateTimeMs);
      document.strokeColor(colors.muted).lineWidth(1);
      for (let position = plotX; position < plotX + plotWidth; position += 9) {
        document.moveTo(position, averageY)
          .lineTo(Math.min(position + 5, plotX + plotWidth), averageY).stroke();
      }
      document.font('Helvetica').fontSize(7).fillColor(colors.muted)
        .text(`${averageUpdateTimeMs.toFixed(1)} ms`, plotX + plotWidth - 65, averageY - 12, { width: 65, align: 'right' });
    }
    if (failedQueriesByWindow) {
      const peakFailures = Math.max(1, ...failedQueriesByWindow);
      failedQueriesByWindow.forEach((count, window) => {
        if (!count) return;
        const barWidth = Math.max(2, plotWidth / failedQueriesByWindow.length - 5);
        const barHeight = count / peakFailures * plotHeight * 0.35;
        const barX = plotX + (window + 0.5) / failedQueriesByWindow.length * plotWidth - barWidth / 2;
        document.rect(barX, plotY + plotHeight - barHeight, barWidth, barHeight)
          .fillColor(colors.failed).fillOpacity(0.75).fill().fillOpacity(1);
      });
      document.font('Helvetica').fontSize(7).fillColor(colors.muted)
        .text(`${peakFailures} failed`, plotX + plotWidth - 65, plotY - 10, { width: 65, align: 'right' });
    }
    for (const item of series) {
      let connected = false;
      document.strokeColor(item.color).fillColor(item.color).lineWidth(1.5);
      for (const point of item.points) {
        if (!point) {
          if (connected) document.stroke();
          connected = false;
          continue;
        }
        if (!connected) document.moveTo(x(point.time), ordinate(point.value));
        else document.lineTo(x(point.time), ordinate(point.value));
        connected = true;
      }
      if (connected) document.stroke();
      for (const point of item.points) {
        if (point) document.circle(x(point.time), ordinate(point.value), 1.5).fill(item.color);
      }
    }
    if (Number.isFinite(firstTime) && Number.isFinite(lastTime)) {
      document.font('Helvetica').fontSize(7).fillColor(colors.muted)
        .text(new Date(firstTime).toLocaleTimeString(), plotX, plotY + plotHeight + 5);
      document.text(new Date(lastTime).toLocaleTimeString(), plotX + plotWidth - 75, plotY + plotHeight + 5, { width: 75, align: 'right' });
    }
    let legendY = plotY + plotHeight + 24;
    series.forEach((item, index) => {
      if (index % 2 === 0) {
        if (index > 0) legendY += 15;
        legendY = this.ensureSpace(document, legendY, 17);
      }
      const xPosition = margin + (index % 2) * (width / 2);
      document.circle(xPosition + 4, legendY + 5, 3).fill(item.color);
      document.font('Helvetica').fontSize(8).fillColor(colors.ink)
        .text(shortText(item.label, 35), xPosition + 14, legendY, { width: width / 2 - 18, lineBreak: false });
    });
    if (averageUpdateTimeMs !== null && averageUpdateTimeMs !== undefined) {
      legendY += 15;
      legendY = this.ensureSpace(document, legendY, 17);
      document.strokeColor(colors.muted).lineWidth(1).moveTo(margin, legendY + 5)
        .lineTo(margin + 10, legendY + 5).stroke();
      document.font('Helvetica').fontSize(8).fillColor(colors.ink)
        .text(`Overall average (${averageUpdateTimeMs.toFixed(1)} ms)`, margin + 14, legendY);
    }
    if (failedQueriesByWindow) {
      legendY += 15;
      legendY = this.ensureSpace(document, legendY, 17);
      document.rect(margin + 1, legendY + 2, 7, 7).fill(colors.failed);
      document.font('Helvetica').fontSize(8).fillColor(colors.ink)
        .text(`Failed queries (${failedQueriesByWindow.reduce((sum, count) => sum + count, 0)})`, margin + 14, legendY);
    }
    return legendY + 28;
  }

  private instanceTable(document: PDFKit.PDFDocument, proposedY: number, instances: BenchmarkPdfInstance[]): void {
    let y = this.ensureSpace(document, proposedY, 75);
    document.font('Helvetica-Bold').fontSize(12).fillColor(colors.ink)
      .text('Instance Statistics', margin, y);
    y += 24;
    const columns = [
      { label: 'Instance', width: 90 },
      { label: 'Adapter', width: 82 },
      { label: 'Queries', width: 41 },
      { label: 'Failed', width: 38 },
      { label: 'Query Lost', width: 47 },
      { label: 'Footprint', width: 61 },
      { label: 'Average', width: 54 },
      { label: 'Mean dev.', width: 54 },
      { label: 'Peak dev.', width: 44 },
    ];
    const header = () => {
      let x = margin;
      document.font('Helvetica-Bold').fontSize(7).fillColor(colors.muted);
      columns.forEach((column) => {
        document.text(column.label, x + 2, y, { width: column.width - 4, lineBreak: false });
        x += column.width;
      });
      y += 17;
    };
    header();
    for (const instance of instances) {
      if (y + 20 > document.page.height - 55) {
        document.addPage();
        y = margin;
        header();
      }
      const values = [
        shortText(instance.name, 19),
        shortText(providerLabel(instance.adapter), 18),
        String(instance.queryCount),
        String(instance.failedQueryCount),
        instance.queryCount ? `${(instance.failedQueryCount / instance.queryCount * 100).toFixed(1)}%` : '-',
        instance.footprintBytes === null ? '-' : `${instance.footprintBytes} B`,
        formatDuration(instance.averageUpdateTimeMs),
        formatDuration(instance.meanDeviationMs),
        formatDuration(instance.peakDeviationMs),
      ];
      let x = margin;
      document.font('Helvetica').fontSize(7).fillColor(colors.ink);
      values.forEach((value, index) => {
        document.text(value, x + 2, y, { width: columns[index].width - 4, lineBreak: false });
        x += columns[index].width;
      });
      document.strokeColor(colors.border).lineWidth(0.4)
        .moveTo(margin, y + 15).lineTo(document.page.width - margin, y + 15).stroke();
      y += 19;
    }
  }
}
