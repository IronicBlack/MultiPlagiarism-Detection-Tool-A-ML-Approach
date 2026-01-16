import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const PlagiarismChart = ({ results }) => {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!results || results.length === 0) {
      console.log('📊 Chart: No results to display');
      return;
    }
    
    console.log('📊 Chart: Rendering with results:', results);
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Use the actual results data
    const x = d3.scaleBand()
      .domain(results.map(d => d.document))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add bars using actual similarity data
    g.selectAll('.bar')
      .data(results)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.document))
      .attr('y', d => y(d.similarity))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.similarity))
      .attr('fill', d => {
        if (d.similarity > 70) return '#e74c3c';
        if (d.similarity > 40) return '#f39c12';
        return '#27ae60';
      });
    
    // Add similarity percentages
    g.selectAll('.text')
      .data(results)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.document) + x.bandwidth() / 2)
      .attr('y', d => y(d.similarity) - 5)
      .attr('text-anchor', 'middle')
      .text(d => `${d.similarity.toFixed(1)}%`);
    
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-15)")
      .style("text-anchor", "end")
      .style("font-size", "10px");
    
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`));
    
    // Add chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Plagiarism Detection Results');
      
  }, [results]);

  if (!results || results.length === 0) {
    return (
      <div className="chart-container" style={{ textAlign: 'center', padding: '20px' }}>
        <p>No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <svg ref={svgRef} width="600" height="320"></svg>
    </div>
  );
};

export default PlagiarismChart;