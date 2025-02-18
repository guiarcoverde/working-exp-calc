import { Component, HostListener } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NgForOf, NgIf, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

    empregos: {nome: string; dataInicio: string; dataTermino: string}[] = [
      {nome: '', dataInicio: '', dataTermino: ''},
    ];

    adicionarExperiencia(): void {
      this.empregos.push({nome: '', dataInicio: '', dataTermino: ''});
      this.erros.push('');
    }

    resultado: string | number | null = null;

    erros: string[] = [];

  calcularTempoDeExperiencia(): void {
    const intervalos = this.empregos
      .filter(emprego => emprego.dataInicio && emprego.dataTermino)
      .map(emprego => ({
        inicio: new Date(emprego.dataInicio),
        termino: new Date(emprego.dataTermino),
      }))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    if (intervalos.length === 0) {
      this.resultado = "Não é possível calcular sem inserir datas.";
      return;
    }

    const intervalosValidos: { inicio: Date; termino: Date }[] = [];

    intervalos.forEach(intervalo => {
      if (
        intervalosValidos.length === 0 ||
        intervalosValidos[intervalosValidos.length - 1].termino < intervalo.inicio
      ) {
        intervalosValidos.push(intervalo);
      } else {
        const ultimo = intervalosValidos[intervalosValidos.length - 1];
        ultimo.termino = new Date(
          Math.max(ultimo.termino.getTime(), intervalo.termino.getTime())
        );
      }
    });

    let totalMeses = 0;
    intervalosValidos.forEach(intervalo => {
      let inicio = new Date(intervalo.inicio);
      let termino = new Date(intervalo.termino);

      // Calcula a diferença de meses
      let anosDeDiferenca = termino.getFullYear() - inicio.getFullYear();
      let mesesDeDiferenca = termino.getMonth() - inicio.getMonth();

      // Se o mês de término for antes do mês de início no mesmo ano, subtrai um ano de diferença
      if (mesesDeDiferenca < 0) {
        anosDeDiferenca--;
        mesesDeDiferenca += 12;
      }

      // A diferença total de meses é anosDeDiferenca * 12 + mesesDeDiferenca
      totalMeses += anosDeDiferenca * 12 + mesesDeDiferenca;
    });


    let totalDias = 0;
    intervalosValidos.forEach(intervalo => {
      const inicio = intervalo.inicio.getTime();
      const termino = intervalo.termino.getTime();

      // Verifica se a data de término é posterior à de início, para evitar números negativos
      if (termino >= inicio) {
        const diff = Math.ceil(((termino - inicio) / (1000 * 60 * 60 * 24)) + 1); // Inclui o último dia
        totalDias += diff;
      }
    });
    let anos = 0;
    let meses = 0;
    let dias = 0;

    const getDateDifference = (start: Date, end: Date): { years: number, months: number, days: number } => {
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        months--;
        const tempDate = new Date(end.getFullYear(), end.getMonth(), 0);
        days += tempDate.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      return { years, months, days };
    };

    intervalosValidos.forEach(intervalo => {
      const inicio = new Date(intervalo.inicio);
      const termino = new Date(intervalo.termino);

      if (termino < inicio) return;

      const diff = getDateDifference(inicio, termino);
      anos += diff.years;
      meses += diff.months;
      dias += diff.days;
    });

    // Ajuste para dias excedentes (ex: 30 dias vira 1 mês)
    if (dias >= 30) {
      const mesesExtras = Math.floor(dias / 30);
      meses += mesesExtras;
      dias = dias % 30;
    }

    // Ajuste para meses excedentes (ex: 12 meses vira 1 ano)
    if (meses >= 12) {
      const anosExtras = Math.floor(meses / 12);
      anos += anosExtras;
      meses = meses % 12;
    }

    // Formatação do resultado
    let anosStr = anos === 1 ? "1 ano" : anos > 1 ? `${anos} anos` : "";
    let mesesStr = meses === 1 ? "1 mês" : meses > 0 ? `${meses} meses` : "";
    let diasStr = dias === 1 ? "1 dia" : dias > 0 ? `${dias} dias` : "";

    const partes = [anosStr, mesesStr, diasStr].filter(parte => parte !== "");
    // Adiciona "e" antes do último elemento se houver mais de um componente
    if (partes.length > 1) {
      const ultimo = partes.pop();
      this.resultado = `${partes.join(", ")} e ${ultimo}. (${totalDias} dias)`;
    } else {
      this.resultado = `${partes.join(", ")}. (${totalDias} dias)`;
    }
  }

  validarDatas(index: number): void {
    const emprego = this.empregos[index];
    const dataInicio = emprego.dataInicio ? new Date(emprego.dataInicio) : null;
    const dataTermino = emprego.dataTermino ? new Date(emprego.dataTermino) : null;

    // Garantir que ambas as datas existem antes de validar
    if (dataInicio && dataTermino) {
      if (dataInicio > dataTermino) {
        this.erros[index] = 'Data de início não pode ser posterior à data de término.';
        // Opcional: Limpar as datas
        this.empregos[index].dataInicio = '';
        this.empregos[index].dataTermino = '';
      } else {
        this.erros[index] = '';
      }
    }
  }

  removerExperiencia(index: number): void {
    if (this.empregos.length === 1) {
      alert("Não é possível remover um único emprego cadastrado.")
      return;
    }

    this.empregos.splice(index, 1);
    }

  removerTodasAsExperiencias(): void {
    this.empregos = [{nome: '', dataInicio: '', dataTermino: ''}];
    this.erros = [''];
    this.resultado = null;
  }

  private hasUnsavedData(): boolean {
    return this.empregos.some(emprego =>
      emprego.dataInicio.trim() !== '' || emprego.dataTermino.trim() !== ''
    );
  }

  // Handler para o evento beforeunload
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedData()) {
      event.preventDefault();
      event.returnValue = true;
    }
  }

  // Remove o listener quando o componente é destruído
  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

}
