sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    '../model/formatter',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
  ],
  function (Controller, formatter, JSONModel, Filter, FilterOperator) {
    'use strict';
    const iCol = 2;
    return Controller.extend('sap.ui.demo.basicTemplate.controller.App', {
      formatter: formatter,

      onInit: function () {
        this.oModelJson = new JSONModel();
        this.atthachComliteFunction();
      },

      onSelectedAuthor: function (oEvent) {
        var idAuthor = oEvent.getSource().getSelectedKey();
        this.getIdBooksFromModel(idAuthor);
        this.loadBooks();
        this.cleanBooksSelected();
        this.setFilterForSelectedAuthor();
      },
      cleanBooksSelected: function () {
        var oBooksBoxSelected = this.getView().byId('idBooks');
        oBooksBoxSelected.setValue('');
      },

      getIdBooksFromModel: function (idAuthor) {
        var oModelAutors = this.getView().getModel('authors');
        var aAutors = oModelAutors.getProperty('/');
        var aBooks = [];
        aAutors.forEach(function (line) {
          if (line.id == idAuthor) {
            aBooks.push(line.idBook);
          }
        });
        oModelAutors.setProperty('/selectedBooks', aBooks);
      },

      loadBooks: function () {
        var oModelAutors = this.getView().getModel('authors');
        var oModelBooks = this.getView().getModel('books');
        var aBooks = oModelAutors.getProperty('/selectedBooks');
        var bIsLoadedAll = oModelBooks.getProperty('/allIsLoading');
        this.oModelJson.oModelCash = oModelBooks;
        var that = this;
        if (!bIsLoadedAll) {
          if (aBooks.length > iCol) {
            this.loadAllDataBooks();
            oModelBooks.setProperty('allIsLoading', true);
          } else if (!this.checkBookIsLoad()) {
            this.loadSingleQuery();
          }
        }
      },

      completedLoading: function () {
        var oModel = this.oModelCash;
        var aBooks = oModel.getProperty('/books');

        var aData = [];
        if (this.oData.id) {
          aData = [this.oData];
        } else {
          aData = this.oData;
        }

        if (aBooks && aData.length < 2) {
          aBooks = aBooks.concat(aData);
        } else aBooks = aData;

        if (aData.length > 1) {
          oModel.setProperty('/allIsLoading', true);
        }
        oModel.setProperty('/books', aBooks);
        oModel.refresh(true);
      },

      atthachComliteFunction() {
        var bIsAttach = false;

        if (this.oModelJson.mEventRegistry.requestCompleted) {
          this.oModelJson.mEventRegistry.requestCompleted.forEach(function (
            fFunction
          ) {
            if (fFunction.fFunction.name === 'completedLoading') {
              bIsAttach = true;
            }
          });
        }
        if (!bIsAttach) {
          this.oModelJson.attachRequestCompleted(this.completedLoading);
        }
      },

      loadAllDataBooks: function () {
        return this.oModelJson.loadData(
          'https://fakerestapi.azurewebsites.net/api/v1/Books'
        );
      },

      loadSingleQuery: function () {
        var oModelAutors = this.getView().getModel('authors');
        var oModelBooks = this.oModelJson;
        var that = this;
        var aBooks = oModelAutors.getProperty('/selectedBooks');
        aBooks.forEach(function (line) {
          oModelBooks.loadData(
            'https://fakerestapi.azurewebsites.net/api/v1/Books/' + line
          );
        });
      },

      checkBookIsLoad: function () {
        var oModelAutors = this.getView().getModel('authors');
        var aBooksSelected = oModelAutors.getProperty('/selectedBooks');
        var oModelCash = this.getView().getModel('books');
        var aCashBooks = oModelCash.getProperty('/books');
        if (!aCashBooks) return false;
        var bCach = false;
        aBooksSelected.forEach(function (line) {
          aCashBooks.forEach(function (cash) {
            if (line === cash.id) {
              bCach = true;
            }
          });
        });
        return bCach;
      },

      setFilterForSelectedAuthor() {
        var oModelAutors = this.getView().getModel('authors');
        var aBooks = oModelAutors.getProperty('/selectedBooks');
        var aFilter = [];
        aBooks.forEach(function (line) {
          aFilter.push(new Filter('id', FilterOperator.EQ, line));
        });
        var oComboboxBooks = this.getView().byId('idBooks');
        var oBinding = oComboboxBooks.getBinding('items');
        oBinding.filter(aFilter);
      }
    });
  }
);
