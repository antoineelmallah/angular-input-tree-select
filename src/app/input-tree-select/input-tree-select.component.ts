import { Component, OnInit, Input, AfterViewInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'input-tree-select',
  templateUrl: './input-tree-select.component.html',
  styleUrls: ['./input-tree-select.component.css'],
  providers:
    [ { 
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => InputTreeSelectComponent),
  }],

})
export class InputTreeSelectComponent implements ControlValueAccessor, AfterViewInit {

  @Input() datasource: IDatasource;

  private _idSelecionado = new BehaviorSubject(null);

  get idSelecionado() {
    return this._idSelecionado.value;
  }

  set idSelecionado(id: any) {
    this._idSelecionado.next(id);
  }

  noSelecionado: INoHierarquia;

  private cachePorNiveis: Map<number, INoHierarquia[]> = new Map();

  private getCachePorId(id: string): INoHierarquia {
    this.cachePorNiveis.forEach(v => {
      const no = v.find(i => String(i.id) === id);
      if (no) return no;
    });
    return null;
  }

  private filhosPrimeiroNivel: INoHierarquia[] = [];

  get filhos(): INoHierarquia[] {
    if (this.noSelecionado) {
      if (!this.noSelecionado.filhosPopulados) {
        this.datasource.popularFilhos(this.noSelecionado);
      }
      return this.noSelecionado.filhos;
    }
    return this.filhosPrimeiroNivel;
  }

  get nos(): INoHierarquia[] {
    let no = this.noSelecionado;
    const nos: INoHierarquia[] = [];
    nos.push(no);
    while (no.paiId) {
      const pai = this.getCachePorId(no.paiId);
      nos.push(pai);
      no = pai;
    }
    return nos.reverse();
  }

  disabled: boolean;



  /////////////////////////////////////////

  chavesHierarquia = [];

  itens = [];

  nivel = 1;


  constructor() { }

  ngAfterViewInit() {
    this.datasource.getPrimeiroNivel().subscribe(nos => {
      this.filhosPrimeiroNivel.push(...nos);
      this.cachePorNiveis.set(1, nos);
    });
  }

  selecionar(no: INoHierarquia) {
    console.log(no);
  }

  limpar() {

  }

  // Implementação de ControlValueAccessor
  writeValue(id: any): void {
    this.idSelecionado = id;
    if (id || id === 0) {
      this.datasource.getNoComFilhos(id).subscribe(no => {
        this.noSelecionado = no;
      });
    }
  }

  registerOnChange(fn: any): void {
    this._idSelecionado.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this._idSelecionado.subscribe(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}

export interface INoHierarquia {

  id: string;
  chave: string;
  descricao: string;
  nivel: number;
  paiId?: string;
  filhosPopulados: boolean;
  filhos: INoHierarquia[];

}

export interface IDatasource {

  getNoComFilhos(id: string): Observable<INoHierarquia>;
  getPrimeiroNivel(): Observable<INoHierarquia[]>;
  popularFilhos(no: INoHierarquia): Observable<void>;

}