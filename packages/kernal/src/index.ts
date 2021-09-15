import Board from '@idraw/board';
import { TypeCoreOptions, TypeConfig } from '@idraw/types'
import { _opts, _config, _board, _todo } from './names';

class Kernal {

  private [_board]: Board;
  private [_opts]: TypeCoreOptions;
  private [_config]: TypeConfig;

  constructor(board: Board, opts: TypeCoreOptions, config?: TypeConfig) {
    this[_board] = board;
    this[_opts] = opts;
    this[_config] = config || {};
  }

  // TODO avoid ts error
  [_todo]() {
    console.log(this[_board])
    console.log(this[_opts])
    console.log(this[_config])
  }
  
  // getElement(uuid: string) {
  //   // TODO
  // }

  // getElementByIndex(index: number) {
  //   // TODO
  // }

  // selectElementByIndex(index: number, opts?: { useMode?: boolean }): void {
  //   // TODO
  // }

  // selectElement(uuid: string, opts?: { useMode?: boolean }): void {
  //   // TODO
  // }

  // moveUpElement(uuid: string): void {
  //   // TODO
  // }

  // moveDownElement(uuid: string): void {
  //   // TODO
  // }

  // updateElement(elem: TypeElement<keyof TypeElemDesc>) {
  //   // TODO
  // }

  // addElement(elem: TypeElementBase<keyof TypeElemDesc>) {
  //   // TODO
  // }

  // deleteElement(uuid: string) {
  //   // TODO
  // }

  // insertElementBefore(elem: TypeElementBase<keyof TypeElemDesc>, beforeUUID: string) {
  //   // TODO
  // }

  // insertElementBeforeIndex(elem: TypeElementBase<keyof TypeElemDesc>, index: number) {
  //   // TODO
  // }

  // getSelectedElements() {
  //   // TODO
  // }

  // insertElementAfter(elem: TypeElementBase<keyof TypeElemDesc>, beforeUUID: string) {
  //   // TODO
  // }

  // insertElementAfterIndex(elem: TypeElementBase<keyof TypeElemDesc>, index: number) {
  //  // TODO
  // }

  // resetSize(opts: TypeBoardSizeOptions) {
  //   // TODO
  // }

  // scale(ratio: number): TypeScreenContext {
  //   // TODO
  // }

  // scrollLeft(left: number): TypeScreenContext {
  //   // TODO
  // }

  // scrollTop(top: number): TypeScreenContext {
  //   // TODO
  // }

  // getScreenTransform(): TypeScreenData {
  //   // TODO
  // }

  // getData(): TypeData {
  //   // TODO
  // }

  // setData(data: any | TypeData, opts?: { triggerChangeEvent: boolean }): void {
  //   // TODO
  // }

  // clearOperation() {
  //  // TODO
  // }

  // on<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
  //  // TODO
  // }

  // off<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
  //   // TODO
  // }

  // pointScreenToContext(p: TypePoint) {
  //   // TODO
  // }

  // pointContextToScreen(p: TypePoint) {
  //   // TODO
  // }

  // __getBoardContext(): TypeContext {
  //   // TODO
  // }

  // __getDisplayContext(): CanvasRenderingContext2D {
  //   // TODO
  // }

  // __getOriginContext(): CanvasRenderingContext2D {
  //   // TODO
  // }


}

export default Kernal;