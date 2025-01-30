import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {BsDatepickerInputDirective} from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NgForOf, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

    empregos: {dataInicio: string; dataTermino: string}[] = [
      {dataInicio: '', dataTermino: ''},
    ];

    adicionarExperiencia(): void {
      this.empregos.push({dataInicio: '', dataTermino: ''});
      this.erros.push('');
    }

    resultadoDias: string | number |null = null;
    resultadoMeses: string | number |null = null;

    erros: string[] = [];

  calcularTempoDeExperiencia(): void {
    const intervalos = this.empregos
      .filter(emprego => emprego.dataInicio && emprego.dataTermino)
      .map(emprego => ({
        inicio: new Date(emprego.dataInicio),
        termino: new Date(emprego.dataTermino),
      }))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

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

    intervalosValidos.forEach(intervalo => {
      let inicio = new Date(intervalo.inicio);
      let termino = new Date(intervalo.termino);

      // Calcula diferença de anos
      while (inicio.getFullYear() < termino.getFullYear()) {
        if (
          inicio.getMonth() === termino.getMonth() &&
          inicio.getDate() > termino.getDate()
        ) {
          break;
        }
        anos++;
        inicio.setFullYear(inicio.getFullYear() + 1);
      }

      // Calcula diferença de meses
      while (
        inicio.getFullYear() === termino.getFullYear() &&
        inicio.getMonth() < termino.getMonth()
        ) {
        meses++;
        inicio.setMonth(inicio.getMonth() + 1);
      }

      // Calcula diferença de dias
      dias += Math.floor(
        ((termino.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
    });

// Aqui é onde você cria a mensagem
    let anosStr = anos === 1 ? "1 ano" : anos > 1 ? `${anos} anos` : "";
    let mesesStr = meses === 1 ? "1 mês" : meses > 0 ? `${meses} meses` : "";
    let diasStr = dias === 1 ? "1 dia" : dias > 0 ? `${dias} dias` : "";

// Para o total de meses
    let totalMesesStr = totalMeses > 0 ? `${totalMeses} meses` : "";

// Montar o resultado com os elementos disponíveis

    this.resultadoDias = totalDias;
    this.resultadoMeses = totalMeses;

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
      this.empregos.splice(index, 1);
    }
}
