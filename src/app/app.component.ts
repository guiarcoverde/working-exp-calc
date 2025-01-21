import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {BsDatepickerInputDirective} from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, NgForOf, NgIf, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
    empregos: {dataInicio: string | number; dataTermino: string | number}[] = [
      {dataInicio: '', dataTermino: ''},
    ];

    adicionarExperiencia(): void {
      this.empregos.push({dataInicio: '', dataTermino: ''});
    }

    resultado: string | null = null;

    calcularTempoDeExperiencia() {
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

      const anos = Math.floor(totalDias / 365);
      const meses = Math.floor((totalDias % 365) / 30);
      const dias = totalDias % 30;

      this.resultado = `${anos} ano(s), ${meses} mês(es), ${dias} dia(s) de experiência total. (${totalDias} dias)`;
    }
}
