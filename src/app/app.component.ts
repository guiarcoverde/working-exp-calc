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

    resultado: string | null = null;
    erros: string[] = [];

    calcularTempoDeExperiencia(): void {
      const intervalos = this.empregos
        .filter(emprego => emprego.dataInicio && emprego.dataTermino)
        .map(emprego => ({
          inicio: new Date(emprego.dataInicio),
          termino: new Date(emprego.dataTermino),
        }))
        .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

      const intervalosValidos: {inicio: Date, termino: Date}[] = [];

      intervalos.forEach(intervalo => {
        if(intervalosValidos.length === 0 || intervalosValidos[intervalosValidos.length - 1].termino < intervalo.inicio){
          intervalosValidos.push(intervalo);
        } else {
          const ultimo = intervalosValidos[intervalosValidos.length - 1];
          ultimo.termino = new Date(
            Math.max(ultimo.termino.getTime(), intervalo.termino.getTime())
          );
        }
      });

      let totalDias = 0;
      intervalosValidos.forEach(intervalo => {
        const diff = Math.ceil(
          (intervalo.termino.getTime() - intervalo.inicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDias += diff;

      });

      let anos = 0;
      let meses = 0;
      let dias = 0;

      intervalosValidos.forEach(intervalo => {
        let inicio = intervalo.inicio;
        let termino = intervalo.termino;

        while (inicio < termino) {
          const proximoMes = new Date(
            inicio.getFullYear(),
            inicio.getMonth() + 1,
            inicio.getDate()
          );
          if (proximoMes <= termino) {
            meses++;
            inicio = proximoMes;
          } else {
            break;
          }
        }

        dias += Math.floor(
          (termino.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
        );
      });

      while (dias >= 30) {
        dias -= 30;
        meses++;
      }

      while (meses >= 12) {
        meses -= 12;
        anos++;
      }

      let anosStr = anos === 1 ? "1 ano" : anos > 1 ? `${anos} anos` : "";
      let mesesStr = meses === 1 ? "1 mês" : meses > 0 ? `${meses} meses` : "";
      let diasStr = dias === 1 ? "1 dia" : dias > 0 ? `${dias} dias` : "";
      
      let partes = [anosStr, mesesStr, diasStr].filter((parte) => parte !== ""); // Filtra partes vazias
      this.resultado = `${partes.join(", ")} de experiência total. (${totalDias} dias)`;
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
