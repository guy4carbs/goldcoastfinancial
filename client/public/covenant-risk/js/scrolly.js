(function() {
  'use strict';

  // Only init if scrollama and the process section exist
  if (typeof scrollama === 'undefined') return;
  if (!document.querySelector('.process-container')) return;

  var scroller = scrollama();

  var phases = [
    {
      num: '01',
      phase: 'Discovery',
      headline: 'Define the Exposure',
      desc: 'We map your full financial world \u2014 income, assets, debt, dependents, existing coverage. We understand your life better than most advisors ever will.',
      output: 'Client Risk Snapshot'
    },
    {
      num: '02',
      phase: 'Stress Test',
      headline: 'Expose the Cracks',
      desc: 'We walk through real-life scenarios \u2014 premature death, disability, longevity \u2014 and model the financial consequences of each. You see exactly where your plan fails.',
      output: 'Risk Exposure Gaps'
    },
    {
      num: '03',
      phase: 'Quantification',
      headline: 'Put Numbers on the Risk',
      desc: 'We assign real dollar figures to your exposure \u2014 income replacement, debt obligations, retirement gaps. Abstract fear becomes measurable reality.',
      output: 'Total Risk Liability Number'
    },
    {
      num: '04',
      phase: 'Covenant Design',
      headline: 'Engineer the Solution',
      desc: 'This is where we build your Covenant. A structured plan: If X happens \u2192 Y is already handled. Tools are deployed. Products are secondary.',
      output: 'Covenant Blueprint'
    },
    {
      num: '05',
      phase: 'Implementation',
      headline: 'Lock It In',
      desc: 'We put the structure in place. Application, ownership, beneficiary design, funding strategy. Nothing is left to chance.',
      output: 'Active Protection Structure'
    },
    {
      num: '06',
      phase: 'Oversight',
      headline: 'Maintain the Covenant',
      desc: 'Annual reviews, life-event adjustments, policy optimization. Your Covenant evolves as your life evolves. This is where we separate from 99% of the industry.',
      output: 'Long-Term Client Relationship'
    }
  ];

  function updatePanel(index) {
    var d = phases[index];
    var panel = document.querySelector('.sticky-panel');
    if (!panel) return;

    // Fade out
    panel.style.opacity = '0';

    setTimeout(function() {
      panel.querySelector('.sp-num').textContent = d.num;
      panel.querySelector('.sp-phase').textContent = d.phase;
      panel.querySelector('.sp-headline').textContent = d.headline;
      panel.querySelector('.sp-desc').textContent = d.desc;
      panel.querySelector('.output-value').textContent = d.output;

      // Update progress bar
      var pct = ((index + 1) / 6) * 100;
      panel.querySelector('.progress-fill').style.height = pct + '%';

      // Show CTA on final phase
      var cta = panel.querySelector('.sp-cta');
      if (cta) {
        cta.classList.toggle('hidden', index < 5);
      }

      // Add complete class on phase 6
      panel.classList.toggle('complete', index === 5);

      // Fade in
      panel.style.opacity = '1';
    }, 150);
  }

  scroller.setup({
    step: '.step',
    offset: 0.5,
    debug: false
  })
  .onStepEnter(function(response) {
    // Remove active from all steps
    document.querySelectorAll('.step').forEach(function(s) {
      s.classList.remove('active');
    });
    // Add active to current
    response.element.classList.add('active');
    updatePanel(response.index);
  })
  .onStepExit(function(response) {
    response.element.classList.remove('active');
  });

  window.addEventListener('resize', scroller.resize);
})();
