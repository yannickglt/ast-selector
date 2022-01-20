import { Component, ChangeDetectionStrategy } from '@angular/core';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private static SELECTOR_EXAMPLE: string =
    ':has(:root > .type:val("VariableDeclarator")) .id';
  private static CODE_EXAMPLE: string =
    '// Life, Universe, and Everything\nvar answer = 6 * 7;';
  public jsEditor = null;
  public jsonEditor = null;
  public readonly jsEditorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    mode: 'application/javascript',
    theme: 'mbo',
  };
  public readonly jsonEditorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    mode: 'application/json',
    theme: 'mbo',
  };
  public selector: string =
    localStorage.getItem('selector') || AppComponent.SELECTOR_EXAMPLE;
  public jsCode: string =
    localStorage.getItem('jscode') || AppComponent.CODE_EXAMPLE;
  public status = 'loading';
  public json = null;
  public jsonCode = null;
  public error = null;
  public matches = [];
  public markers = [];

  public updateSelector(): void {
    this.status = 'loading';
    localStorage.setItem('selector', this.selector);
    this.highlightMatches();
    this.status = 'ready';
  }

  updateJs() {
    this.status = 'loading';
    localStorage.setItem('jscode', this.jsCode);
    this.jsToJson();
    this.status = 'ready';
  }

  public updateJson(): void {
    this.status = 'loading';
    this.jsonToJs();
    localStorage.setItem('jscode', this.jsCode);
    this.status = 'ready';
  }

  public jsToJson(): void {
    this.error = null;
    this.jsonCode = null;

    try {
      this.json = esprima.parse(this.jsCode, {
        loc: true,
        comment: true,
        tokens: true,
        range: true,
      });
      this.json = escodegen.attachComments(
        this.json,
        this.json.comments,
        this.json.tokens
      );
    } catch (e) {
      this.error = {
        source: 'Esprima',
        message: e.message,
      };
    }

    this.highlightMatches();
  }

  public jsonToJs(): void {
    this.error = null;
    this.jsCode = null;

    try {
      this.json = JSON.parse(this.jsonCode);
      this.jsCode = escodegen.generate(this.json, {
        comment: true,
      });
    } catch (e) {
      this.error = {
        source: 'Escodegen',
        message: e.message,
      };
    }

    this.highlightMatches();
  }

  private calculateMatches(): void {
    this.matches = [];
    try {
      const matches = JSONSelect.stringify(this.selector, this.json);
      this.matches = matches.matches;
      this.jsonCode = matches.json;
    } catch (e) {
      this.error = {
        source: 'JSONSelect',
        message: e.message,
      };
      return;
    }
  }

  private highlightMatches(): void {
    this.calculateMatches();

    if (this.matches.length > 0) {
      for (let marker of this.markers) {
        marker.clear();
      }
      this.markers = [];
    }

    for (let match of this.matches) {
      if (this.jsEditor) {
        let marker = this.jsEditor.markText(
          {
            line: match.match.loc.start.line - 1,
            ch: match.match.loc.start.column,
          },
          {
            line: match.match.loc.end.line - 1,
            ch: match.match.loc.end.column,
          },
          {
            className: 'cm-matching-selection',
          }
        );
        this.markers.push(marker);
      }

      if (this.jsonEditor) {
        let marker = this.jsonEditor.markText(
          {
            line: match.lineStart - 1,
            ch: match.columnStart,
          },
          {
            line: match.lineEnd - 1,
            ch: match.columnEnd,
          },
          {
            className: 'cm-matching-selection',
          }
        );
        this.markers.push(marker);
      }
    }
  }
}
