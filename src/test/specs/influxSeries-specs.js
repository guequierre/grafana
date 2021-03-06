define([
  'services/influxdb/influxSeries'
], function(InfluxSeries) {
  'use strict';

  describe('when generating timeseries from influxdb response', function() {

    describe('given two series', function() {
      var series = new InfluxSeries({
        seriesList: [
          {
            columns: ['time', 'mean', 'sequence_number'],
            name: 'prod.server1.cpu',
            points: [[1402596000, 10, 1], [1402596001, 12, 2]]
          },
          {
            columns: ['time', 'mean', 'sequence_number'],
            name: 'prod.server2.cpu',
            points: [[1402596000, 15, 1], [1402596001, 16, 2]]
          }
        ]
      });

      var result = series.getTimeSeries();

      it('should generate two time series', function() {
        expect(result.length).to.be(2);
        expect(result[0].target).to.be('prod.server1.cpu.mean');
        expect(result[0].datapoints[0][0]).to.be(10);
        expect(result[0].datapoints[0][1]).to.be(1402596000);
        expect(result[0].datapoints[1][0]).to.be(12);
        expect(result[0].datapoints[1][1]).to.be(1402596001);

        expect(result[1].target).to.be('prod.server2.cpu.mean');
        expect(result[1].datapoints[0][0]).to.be(15);
        expect(result[1].datapoints[0][1]).to.be(1402596000);
        expect(result[1].datapoints[1][0]).to.be(16);
        expect(result[1].datapoints[1][1]).to.be(1402596001);
      });

    });

    describe('given an alias format', function() {
      var series = new InfluxSeries({
        seriesList: [
          {
            columns: ['time', 'mean', 'sequence_number'],
            name: 'prod.server1.cpu',
            points: [[1402596000, 10, 1], [1402596001, 12, 2]]
          }
        ],
        alias: '$s.testing'
      });

      var result = series.getTimeSeries();

      it('should generate correct series name', function() {
        expect(result[0].target).to.be('prod.server1.cpu.testing');
      });

    });

    describe('given an alias format with segment numbers', function() {
      var series = new InfluxSeries({
        seriesList: [
          {
            columns: ['time', 'mean', 'sequence_number'],
            name: 'prod.server1.cpu',
            points: [[1402596000, 10, 1], [1402596001, 12, 2]]
          }
        ],
        alias: '$1.mean'
      });

      var result = series.getTimeSeries();

      it('should generate correct series name', function() {
        expect(result[0].target).to.be('server1.mean');
      });

    });

    describe('given an alias format with group by field', function() {
      var series = new InfluxSeries({
        seriesList: [
          {
            columns: ['time', 'mean', 'host'],
            name: 'prod.cpu',
            points: [[1402596000, 10, 'A']]
          }
        ],
        groupByField: 'host',
        alias: '$g.$1'
      });

      var result = series.getTimeSeries();

      it('should generate correct series name', function() {
        expect(result[0].target).to.be('A.cpu');
      });

    });

    describe('given group by column', function() {
      var series = new InfluxSeries({
        seriesList: [
          {
            columns: ['time', 'mean', 'host'],
            name: 'prod.cpu',
            points: [
              [1402596000, 10, 'A'],
              [1402596001, 11, 'A'],
              [1402596000, 5, 'B'],
              [1402596001, 6, 'B'],
            ]
          }
        ],
        groupByField: 'host'
      });

      var result = series.getTimeSeries();

      it('should generate two time series', function() {
        expect(result.length).to.be(2);
        expect(result[0].target).to.be('prod.cpu.A');
        expect(result[0].datapoints[0][0]).to.be(10);
        expect(result[0].datapoints[0][1]).to.be(1402596000);
        expect(result[0].datapoints[1][0]).to.be(11);
        expect(result[0].datapoints[1][1]).to.be(1402596001);

        expect(result[1].target).to.be('prod.cpu.B');
        expect(result[1].datapoints[0][0]).to.be(5);
        expect(result[1].datapoints[0][1]).to.be(1402596000);
        expect(result[1].datapoints[1][0]).to.be(6);
        expect(result[1].datapoints[1][1]).to.be(1402596001);
      });

    });

  });

});
